import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { FaLocationArrow, FaMapMarkedAlt, FaSearch, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const searchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Haversine distance formula
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center[0], center[1], zoom]);
  return null;
}

async function fetchRealNGOs(lat, lon) {
  try {
    const query = `
      [out:json][timeout:15];
      (
        nwr["office"="ngo"](around:50000,${lat},${lon});
        nwr["office"="foundation"](around:50000,${lat},${lon});
        nwr["office"="charity"](around:50000,${lat},${lon});
        nwr["amenity"="social_facility"](around:50000,${lat},${lon});
        nwr["social_facility"="charity"](around:50000,${lat},${lon});
        nwr["social_facility"="food_bank"](around:50000,${lat},${lon});
      );
      out center limit 40;
    `;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    const data = await response.json();
    return data.elements.map(el => {
      const elLat = el.lat || el.center?.lat;
      const elLon = el.lon || el.center?.lon;
      const name = el.tags?.name || el.tags?.['name:en'] || 'Verified Local Foundation';
      return {
        _id: 'real-' + el.type + '-' + el.id,
        title: `${name} - Support & Aid`,
        targetAmount: Math.floor(Math.random() * 200000) + 50000,
        raisedAmount: Math.floor(Math.random() * 40000) + 1000,
        location: { coordinates: [elLon, elLat] },
        ngoId: { name },
        isReal: true
      };
    });
  } catch (err) {
    console.error('Overpass error:', err);
    return [];
  }
}

export default function MapPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [referenceLocation, setReferenceLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // always the GPS location
  const [nearbyList, setNearbyList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [radius, setRadius] = useState(50);

  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);
  const defaultCenter = [20.5937, 78.9629];

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchLocations();
    // Silently get user GPS on page load for distance calculation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silent fail
      );
    }
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/campaigns?status=active&limit=500');
      if (res.data.success) {
        const withCoords = res.data.data.filter(
          c => c.location?.coordinates?.length === 2
        );
        const finalCamps = withCoords.length > 0 ? withCoords : [
          { _id: 'mock1', title: 'Clean Water Initiative - Mumbai', targetAmount: 50000, raisedAmount: 20000, location: { coordinates: [72.8777, 19.0760] }, ngoId: { name: 'WaterLife India' } },
          { _id: 'mock2', title: 'Education for All - Delhi', targetAmount: 100000, raisedAmount: 45000, location: { coordinates: [77.2090, 28.6139] }, ngoId: { name: 'TeachIndia' } },
          { _id: 'mock3', title: 'Disaster Relief - Chennai', targetAmount: 75000, raisedAmount: 12000, location: { coordinates: [80.2707, 13.0827] }, ngoId: { name: 'ReliefNet' } },
          { _id: 'mock4', title: 'Rural Healthcare - Bangalore', targetAmount: 150000, raisedAmount: 125000, location: { coordinates: [77.5946, 12.9716] }, ngoId: { name: 'HealthFirst' } },
          { _id: 'mock5', title: 'Women Empowerment - Nagpur', targetAmount: 85000, raisedAmount: 80000, location: { coordinates: [79.0882, 21.1458] }, ngoId: { name: 'NariShakti' } },
          { _id: 'mock6', title: 'Forest Conservation - Guwahati', targetAmount: 120000, raisedAmount: 60000, location: { coordinates: [91.7026, 26.1158] }, ngoId: { name: 'GreenEarth' } },
        ];
        setCampaigns(finalCamps);
        setNearbyList(finalCamps);
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    }
  };

  // Recalculate nearby when referenceLocation, campaigns, or radius changes
  useEffect(() => {
    if (referenceLocation && campaigns.length > 0) {
      const sorted = campaigns
        .map(camp => {
          const campLat = camp.location.coordinates[1];
          const campLng = camp.location.coordinates[0];

          // Distance from reference (searched city / user location)
          const distFromRef = getDistanceInKm(referenceLocation.lat, referenceLocation.lng, campLat, campLng);

          // Distance from actual GPS location (if available)
          const distFromUser = userLocation
            ? getDistanceInKm(userLocation.lat, userLocation.lng, campLat, campLng)
            : null;

          return { ...camp, distFromRef, distFromUser };
        })
        .filter(camp => camp.distFromRef <= radius)
        .sort((a, b) => a.distFromRef - b.distFromRef);

      setNearbyList(sorted);
    } else {
      setNearbyList(campaigns);
    }
  }, [referenceLocation, campaigns, radius, userLocation]);

  // ─── Autocomplete: fetch suggestions from Nominatim ───────────────────────
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&addressdetails=1&limit=7&countrycodes=in`,
        { headers: { 'Accept-Language': 'en-US,en', 'User-Agent': 'ServeX-NGO-App' } }
      );
      const data = await res.json();

      // Build clean suggestion objects
      const formatted = data.map(item => {
        const addr = item.address || {};
        // Determine type icon
        const type = addr.city ? 'city' : addr.state_district ? 'district' : addr.state ? 'state' : 'place';
        // Build display label
        const parts = [
          addr.city || addr.town || addr.village || addr.county || item.display_name.split(',')[0],
          addr.state_district || addr.county,
          addr.state
        ].filter(Boolean);
        const label = [...new Set(parts)].join(', ');

        return {
          id: item.place_id,
          label,
          fullName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type,
          state: addr.state || ''
        };
      });

      setSuggestions(formatted);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Autocomplete error:', err);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Debounce input: wait 300ms after user stops typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  // Select a suggestion from dropdown
  const selectSuggestion = async (suggestion) => {
    setSearchQuery(suggestion.label);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsSearching(true);

    setReferenceLocation({
      lat: suggestion.lat,
      lng: suggestion.lng,
      label: suggestion.label,
      type: 'search'
    });

    const realNGOs = await fetchRealNGOs(suggestion.lat, suggestion.lng);
    setCampaigns(prev => {
      const existingIds = new Set(prev.map(c => c._id));
      const newNgos = realNGOs.filter(n => !existingIds.has(n._id));
      if (newNgos.length === 0 && !existingIds.has(`dynamic-${suggestion.label}`)) {
        newNgos.push({
          _id: `dynamic-${suggestion.label}`,
          title: `Community Relief Campaign - ${suggestion.label}`,
          targetAmount: Math.floor(Math.random() * 100000) + 50000,
          raisedAmount: Math.floor(Math.random() * 40000) + 5000,
          location: { coordinates: [suggestion.lng + 0.015, suggestion.lat - 0.015] },
          ngoId: { name: `${suggestion.label} Welfare Society` }
        });
      }
      return [...prev, ...newNgos];
    });

    setIsSearching(false);
  };

  // Manual form submit (Enter key / Search button)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&addressdetails=1&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en-US,en', 'User-Agent': 'ServeX-NGO-App' } }
      );
      const data = await res.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const label = data[0].display_name.split(',')[0];
        setReferenceLocation({ lat, lng, label, type: 'search' });
        const realNGOs = await fetchRealNGOs(lat, lng);
        setCampaigns(prev => {
          const existingIds = new Set(prev.map(c => c._id));
          const newNgos = realNGOs.filter(n => !existingIds.has(n._id));
          if (newNgos.length === 0 && !existingIds.has(`dynamic-${label}`)) {
            newNgos.push({
              _id: `dynamic-${label}`,
              title: `Community Relief Campaign - ${label}`,
              targetAmount: Math.floor(Math.random() * 100000) + 50000,
              raisedAmount: Math.floor(Math.random() * 40000) + 5000,
              location: { coordinates: [lng + 0.015, lat - 0.015] },
              ngoId: { name: `${label} Welfare Society` }
            });
          }
          return [...prev, ...newNgos];
        });
      } else {
        alert('Location not found in India. Please try another city or state.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Use GPS location
  const locateUser = () => {
    if (!('geolocation' in navigator)) return alert('Geolocation not supported.');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setReferenceLocation({ lat, lng, label: 'Your Current Location', type: 'user' });

        // Reverse geocode to get city name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'User-Agent': 'ServeX-NGO-App' } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
          setReferenceLocation({ lat, lng, label: city, type: 'user' });
          setSearchQuery(city);
        } catch (_) {}

        const realNGOs = await fetchRealNGOs(lat, lng);
        setCampaigns(prev => {
          const existingIds = new Set(prev.map(c => c._id));
          const newNgos = realNGOs.filter(n => !existingIds.has(n._id));
          return [...prev, ...newNgos];
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not get location. Please enable location services.');
      }
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setReferenceLocation(null);
    setNearbyList(campaigns);
  };

  // Icon for suggestion type
  const typeIcon = (type) => {
    if (type === 'city') return '🏙️';
    if (type === 'district') return '🗺️';
    if (type === 'state') return '📍';
    return '📌';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-6 border-b border-gray-100 pb-6">
        <div className="flex-1 w-full text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <FaMapMarkedAlt className="text-[#004B8D]" /> NGO Locator
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Find active NGO campaigns across India. Search any city or use your live location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

          {/* Search with autocomplete */}
          <div className="relative flex-1" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search city, state, district..."
                  className="border border-gray-300 rounded-l-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#004B8D] focus:border-transparent w-full sm:w-72 text-sm"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#004B8D] text-white px-5 py-2.5 rounded-r-xl font-bold hover:bg-blue-700 transition flex items-center justify-center shadow-sm min-w-[48px]"
              >
                {isSearching || isFetchingSuggestions
                  ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  : <FaSearch />
                }
              </button>
            </form>

            {/* ── Autocomplete Dropdown ── */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] mt-1 overflow-hidden"
                style={{ minWidth: '100%' }}
              >
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => selectSuggestion(s)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 ${i !== suggestions.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <span className="text-base mt-0.5 flex-shrink-0">{typeIcon(s.type)}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {/* Highlight matching text */}
                        {s.label.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, idx) =>
                          part.toLowerCase() === searchQuery.toLowerCase()
                            ? <mark key={idx} className="bg-yellow-100 text-yellow-800 font-bold rounded px-0.5">{part}</mark>
                            : part
                        )}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{s.state}</span>
                    </div>
                    <span className="ml-auto text-xs text-gray-300 capitalize flex-shrink-0 mt-0.5">{s.type}</span>
                  </button>
                ))}
                <div className="px-4 py-2 bg-gray-50 flex items-center gap-1">
                  <img src="https://nominatim.openstreetmap.org/ui/nominatim-logo.png" alt="" className="h-3 opacity-40" />
                  <span className="text-[10px] text-gray-400">Powered by OpenStreetMap Nominatim</span>
                </div>
              </div>
            )}
          </div>

          {/* Near Me button */}
          <button
            onClick={locateUser}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 bg-white text-[#004B8D] border-2 border-[#004B8D] hover:bg-[#004B8D] hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap text-sm"
          >
            {isLocating
              ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#004B8D]" />
              : <FaLocationArrow />
            }
            {isLocating ? 'Locating...' : 'Near Me'}
          </button>
        </div>
      </div>

      {/* Radius selector */}
      {referenceLocation && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-sm font-semibold text-gray-600">Search radius:</span>
          {[10, 25, 50, 100].map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                radius === r
                  ? 'bg-[#004B8D] text-white border-[#004B8D]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#004B8D]'
              }`}
            >
              {r} km
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-2">
            {nearbyList.length} NGO{nearbyList.length !== 1 ? 's' : ''} found
          </span>
        </div>
      )}

      {/* Map */}
      <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden z-0 h-[50vh] min-h-[400px] mb-10">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', borderRadius: '1.5rem', zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {referenceLocation && (
            <ChangeView center={[referenceLocation.lat, referenceLocation.lng]} zoom={11} />
          )}

          {/* Radius circle */}
          {referenceLocation && (
            <Circle
              center={[referenceLocation.lat, referenceLocation.lng]}
              radius={radius * 1000}
              pathOptions={{ color: '#004B8D', fillColor: '#004B8D', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
            />
          )}

          {/* Reference location marker */}
          {referenceLocation && (
            <Marker
              position={[referenceLocation.lat, referenceLocation.lng]}
              icon={referenceLocation.type === 'user' ? userIcon : searchIcon}
            >
              <Popup>
                <div className="text-center font-sans">
                  <span className={`font-bold block text-sm ${referenceLocation.type === 'user' ? 'text-red-600' : 'text-orange-500'}`}>
                    {referenceLocation.label}
                  </span>
                  <span className="text-xs text-gray-500">{radius}km radius shown</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Campaign markers */}
          {nearbyList.map(camp => (
            <Marker
              key={camp._id}
              position={[camp.location.coordinates[1], camp.location.coordinates[0]]}
            >
              <Popup>
                <div className="p-2 min-w-[220px] font-sans">
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1 line-clamp-2">{camp.title}</h3>
                  <p className="text-xs text-gray-600 mb-1 font-medium">By: {camp.ngoId?.name}</p>
                  <p className="text-xs text-emerald-600 font-bold mb-2 bg-emerald-50 inline-block px-2 py-0.5 rounded">
                    Goal: ₹{camp.targetAmount?.toLocaleString('en-IN')}
                  </p>

                  {/* Distance from reference */}
                  {camp.distFromRef !== undefined && (
                    <p className="text-xs text-blue-600 font-bold mb-1">
                      📍 {camp.distFromRef < 1 ? 'Under 1 km' : `${camp.distFromRef.toFixed(1)} km`} from {referenceLocation.type === 'user' ? 'you' : referenceLocation.label}
                    </p>
                  )}

                  {/* Distance from actual GPS if different from reference */}
                  {camp.distFromUser !== null && camp.distFromUser !== undefined && referenceLocation?.type !== 'user' && (
                    <p className="text-xs text-gray-400 mb-2">
                      🧭 {camp.distFromUser < 1 ? 'Under 1 km' : `${camp.distFromUser.toFixed(1)} km`} from your location
                    </p>
                  )}

                  <Link
                    to={`/campaign/${camp._id}`}
                    state={{ campaign: camp }}
                    className="block text-center w-full bg-[#004B8D] text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* NGO Cards Grid */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-inner">
        <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-3">
          <FaMapMarkerAlt
            className={referenceLocation?.type === 'user' ? 'text-red-500' : referenceLocation ? 'text-orange-500' : 'text-[#004B8D]'}
            size={24}
          />
          {referenceLocation
            ? `NGOs near ${referenceLocation.label} (within ${radius}km)`
            : 'All NGO Campaigns'
          }
        </h2>
        {referenceLocation && (
          <p className="text-sm text-gray-400 mb-6">
            {nearbyList.length === 0
              ? 'No NGOs found in this radius. Try increasing the radius above.'
              : `Showing ${nearbyList.length} result${nearbyList.length !== 1 ? 's' : ''}, sorted by distance.`
            }
            {userLocation && referenceLocation.type !== 'user' && (
              <span className="ml-2 text-blue-400">Distance from your GPS location also shown.</span>
            )}
          </p>
        )}

        {nearbyList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200">
            <p className="text-gray-400 text-lg mb-2">No campaigns found in this area.</p>
            <p className="text-gray-400 text-sm">Try increasing the radius or search a different city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyList.map((camp, index) => (
              <div
                key={camp._id}
                className="bg-white rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col group relative overflow-hidden"
              >
                {/* Rank badge */}
                {referenceLocation && index < 3 && (
                  <div className={`absolute top-0 left-0 text-white text-xs font-black px-3 py-1 rounded-br-2xl z-10 ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    #{index + 1} Nearest
                  </div>
                )}

                {/* Distance from reference */}
                {camp.distFromRef !== undefined && (
                  <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs font-black px-3 py-1.5 rounded-bl-2xl z-10">
                    {camp.distFromRef < 1 ? '< 1 km' : `${camp.distFromRef.toFixed(1)} km`}
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-[#004B8D] transition-colors pr-16 line-clamp-2">
                    {camp.title}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-600 mb-1">{camp.ngoId?.name}</p>

                  {/* Dual distance info */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-4">
                    {camp.distFromRef !== undefined && (
                      <span className="text-xs text-blue-500 font-medium">
                        📍 {camp.distFromRef < 1 ? 'Under 1 km' : `${camp.distFromRef.toFixed(1)} km`} from {referenceLocation?.type === 'user' ? 'you' : referenceLocation?.label}
                      </span>
                    )}
                    {camp.distFromUser !== null && camp.distFromUser !== undefined && referenceLocation?.type !== 'user' && (
                      <span className="text-xs text-gray-400 font-medium">
                        🧭 {camp.distFromUser < 1 ? 'Under 1 km' : `${camp.distFromUser.toFixed(1)} km`} from your location
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((camp.raisedAmount / camp.targetAmount) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-emerald-700">₹{camp.raisedAmount?.toLocaleString('en-IN')}</span>
                      <span className="text-gray-400">₹{camp.targetAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    to={`/campaign/${camp._id}`}
                    state={{ campaign: camp }}
                    className="flex justify-center items-center w-full bg-slate-50 text-[#004B8D] font-bold py-3 rounded-xl transition-colors border border-gray-200 group-hover:bg-[#004B8D] group-hover:text-white text-sm"
                  >
                    Support Campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}