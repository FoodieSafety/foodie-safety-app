import React, { useState, useMemo, useEffect } from "react";
import RecallCard from "./RecallCard";
import FilterDropdown from "./FilterDropdown";
import Navbar from "./Navbar";
import config from "./config";

// Helper function to format date from "20251029" to "2025-10-29"
const formatDate = (dateString) => {
  if (!dateString || dateString.length !== 8) return dateString;
  return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
};

// Helper function to determine if a recall date falls within the selected timeframe
const isWithinTimeframe = (recallDateString, filter) => {
  if (!recallDateString) return true;
  
  // Format date if needed (handle both "20251029" and "2025-10-29" formats)
  let formattedDate = recallDateString;
  if (recallDateString.length === 8) {
    formattedDate = formatDate(recallDateString);
  }
  
  const today = new Date();
  const recallDate = new Date(formattedDate);
  
  if (isNaN(recallDate.getTime())) return true; // Invalid date, show it
  
  let daysToSubtract;

  switch (filter) {
    case "Last week":
      daysToSubtract = 7;
      break;
    case "Last two weeks":
      daysToSubtract = 14;
      break;
    case "Last month":
      daysToSubtract = 30;
      break;
    default:
      return true; // Show all if filter is 'All' or empty
  }

  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - daysToSubtract);

  // Check if the recall date is on or after the cutoff date
  return recallDate >= cutoffDate;
};

// Helper function to map classification to status
const getStatusFromClassification = (classification) => {
  if (!classification) return "Unknown";
  // Class I is most serious (Unsafe), Class II/III are less serious (Safe)
  if (classification.includes("Class I")) {
    return "Unsafe";
  } else if (classification.includes("Class II") || classification.includes("Class III")) {
    return "Safe";
  }
  return "Unknown";
};

const RecallsPage = () => {
  const [filter, setFilter] = useState("Last week");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recalls from API
  useEffect(() => {
    const fetchRecalls = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.API_BASE_URL}/recalls`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recalls: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRecalls(data);
      } catch (err) {
        console.error("Error fetching recalls:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecalls();
  }, []);

  // Transform API data and filter
  const filteredRecalls = useMemo(() => {
    // Transform API data to match card format
    const transformedRecalls = recalls.map(recall => ({
      recall_id: recall.recall_id || null,
      name: recall.product_description || null,
      brand: recall.recalling_firm || null,
      code: recall.upcs && recall.upcs.length > 0 ? recall.upcs[0] : null,
      upcs: recall.upcs || [],
      date: recall.report_date ? formatDate(recall.report_date) : null,
      area: recall.distribution || null,
      status: getStatusFromClassification(recall.classification),
      classification: recall.classification || null,
      reasons: recall.reason_for_recall || null,
      product_quantity: recall.product_quantity || null,
      code_info: recall.code_info || null,
      source: recall.source || null,
    }));

    // Filter by timeframe
    if (!filter || filter === 'All') {
      return transformedRecalls;
    }
    return transformedRecalls.filter(recall => isWithinTimeframe(recall.date || recall.report_date, filter));
  }, [recalls, filter]);


  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Navbar component */}
      <Navbar /> 
      
      {/* Yellow Banner Section */}
      <header style={{ 
        backgroundColor: '#FFD700', 
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: 0,
          marginBottom: '0.5rem'
        }}>
          Nation Wide Food Recalls
        </h1>
        <p style={{ 
          color: '#374151',
          margin: 0,
          fontSize: '1rem'
        }}>
          Get recall information across the US
        </p>
      </header>

      <div style={{ padding: '1.5rem' }}> 
        
        {/* Date and Filter Dropdown Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: '1rem',
          marginTop: '1rem',
          marginBottom: '2rem'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#374151',
            margin: 0
          }}>
            Last updated on <strong>{new Date().toLocaleDateString()}</strong>
          </p>
          <FilterDropdown onSelect={setFilter} onOpenChange={setDropdownOpen} />
        </div>

        {/* Display the filtered list - 3 columns grid layout */}
        {/* Add margin-top when dropdown is open to prevent overlap */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#6b7280' }}>Loading recalls...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#dc2626' }}>Error: {error}</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: dropdownOpen ? '120px' : '0',
            transition: 'margin-top 0.2s ease-in-out',
            padding: '0 1rem'
          }}>
            {filteredRecalls.length > 0 ? (
              filteredRecalls.map((recall, i) => (
                <RecallCard key={recall.recall_id || i} recall={recall} />
              ))
            ) : (
              <p style={{ color: '#6b7280', gridColumn: '1 / -1', textAlign: 'center' }}>
                No recalls found for the selected timeframe.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecallsPage;