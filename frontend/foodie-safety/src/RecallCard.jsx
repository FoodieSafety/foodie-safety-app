import React from "react";

const RecallCard = ({ recall }) => {
  // Status colors - red for Unsafe, green for Safe, gray for Unknown
  const getStatusColor = (status) => {
    if (status === "Unsafe") return "#dc2626";
    if (status === "Safe") return "#16a34a";
    return "#6b7280"; // Unknown
  };
  const statusBgColor = getStatusColor(recall.status);
  
  // Card styling - light blue-gray background with black border
  const cardBgColor = '#e8f4f8'; // Light blue-gray
  const cardBorderColor = '#000000'; // Black border
  const borderRadius = '8px'; // Rounded corners

  // Helper to display value or null
  const displayValue = (value) => value !== null && value !== undefined ? value : 'null';

  return (
    <div 
      style={{
        backgroundColor: cardBgColor,
        border: `2px solid ${cardBorderColor}`,
        borderRadius: borderRadius,
        padding: '1rem',
        minWidth: '280px',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.875rem'
      }}
    >
      {/* Header Section - Product Name and Brand */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            {displayValue(recall.name)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#374151'
            }}>
              {displayValue(recall.brand)}
            </span>
            {/* Exclamation mark icon */}
            <span style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              marginLeft: '0.25rem'
            }}>
              !
            </span>
          </div>
        </div>
      </div>

      {/* Product Code(s) */}
      {recall.code && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Product Code:</strong> {displayValue(recall.code)}
        </div>
      )}
      {recall.upcs && recall.upcs.length > 1 && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Additional UPCs:</strong> {recall.upcs.slice(1).join(', ')}
        </div>
      )}

      {/* Report Date */}
      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
        <strong>Report Date:</strong> {displayValue(recall.date)}
      </div>

      {/* Classification */}
      {recall.classification && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Classification:</strong> {displayValue(recall.classification)}
        </div>
      )}

      {/* Status - Pill-shaped label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '600' }}>
          Status:
        </span>
        <span 
          style={{
            backgroundColor: statusBgColor,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px', // Pill shape
            display: 'inline-block'
          }}
        >
          {displayValue(recall.status)}
        </span>
      </div>

      {/* Affected Areas */}
      {recall.area && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Affected Areas:</strong> {displayValue(recall.area)}
        </div>
      )}

      {/* Product Quantity */}
      {recall.product_quantity && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Product Quantity:</strong> {displayValue(recall.product_quantity)}
        </div>
      )}

      {/* Code Info */}
      {recall.code_info && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Code Info:</strong> {displayValue(recall.code_info)}
        </div>
      )}

      {/* Reason for Recall */}
      {recall.reasons && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Reason for Recall:</strong> {displayValue(recall.reasons)}
        </div>
      )}

      {/* Source */}
      {recall.source && (
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          <strong>Source:</strong> {displayValue(recall.source)}
        </div>
      )}
    </div>
  );
};

export default RecallCard;