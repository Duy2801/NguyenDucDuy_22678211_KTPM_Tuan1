import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TestInterface.css';

const API_ENDPOINTS = {
  products: 'http://localhost:8081/products',
  cartGet: 'http://localhost:8082/cart',
  cartAdd: 'http://localhost:8082/cart/add',
  cartRemove: 'http://localhost:8082/cart/remove',
  cartClear: 'http://localhost:8082/cart/clear',
  checkout: 'http://localhost:8083/checkout',
  inventory: 'http://localhost:8084/inventory',
};

function TestInterface({ sessionId }) {
  const [activeTab, setActiveTab] = useState('api-tester');
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('products');
  const [requestBody, setRequestBody] = useState('');
  const [systemStatus, setSystemStatus] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [requestMethod, setRequestMethod] = useState('GET');
  const [responseHistory, setResponseHistory] = useState([]);

  // Check system status
  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    const status = {};
    for (const [name, url] of Object.entries(API_ENDPOINTS)) {
      try {
        const response = await axios.get(url, { timeout: 2000 });
        status[name] = { ok: true, status: 200 };
      } catch (error) {
        status[name] = { ok: false, status: error.response?.status || 'ERROR', message: error.message };
      }
    }
    setSystemStatus(status);
  };

  const testApiCall = async () => {
    try {
      setApiLoading(true);
      const url = API_ENDPOINTS[selectedEndpoint];
      let response;
      const headers = sessionId ? { 'x-session-id': sessionId } : {};

      if (requestMethod === 'GET') {
        response = await axios.get(url, { headers });
      } else if (requestMethod === 'POST') {
        const body = requestBody ? JSON.parse(requestBody) : {};
        response = await axios.post(url, body, { headers });
      }

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: selectedEndpoint,
        method: requestMethod,
        status: response.status,
        data: response.data,
      };

      setApiResponse(result);
      setResponseHistory([result, ...responseHistory.slice(0, 9)]);

      setTestResults([
        {
          id: Date.now(),
          endpoint: selectedEndpoint,
          method: requestMethod,
          status: response.status,
          success: true,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...testResults.slice(0, 19),
      ]);
    } catch (error) {
      const errorResult = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: selectedEndpoint,
        method: requestMethod,
        status: error.response?.status || 'ERROR',
        data: error.response?.data || error.message,
        error: true,
      };

      setApiResponse(errorResult);
      setResponseHistory([errorResult, ...responseHistory.slice(0, 9)]);

      setTestResults([
        {
          id: Date.now(),
          endpoint: selectedEndpoint,
          method: requestMethod,
          status: error.response?.status || 'ERROR',
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...testResults.slice(0, 19),
      ]);
    } finally {
      setApiLoading(false);
    }
  };

  const runFullTest = async () => {
    setTestResults([]);
    for (const endpoint of Object.keys(API_ENDPOINTS)) {
      setSelectedEndpoint(endpoint);
      setRequestMethod('GET');
      
      try {
        const url = API_ENDPOINTS[endpoint];
        const headers = sessionId ? { 'x-session-id': sessionId } : {};
        await axios.get(url, { headers, timeout: 3000 });
        
        setTestResults(prev => [...prev, {
          id: Date.now() + Math.random(),
          endpoint,
          method: 'GET',
          status: 200,
          success: true,
          timestamp: new Date().toLocaleTimeString(),
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          id: Date.now() + Math.random(),
          endpoint,
          method: 'GET',
          status: error.response?.status || 'ERROR',
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }
    }
  };

  return (
    <div className="test-interface">
      <div className="test-header">
        <h2>🧪 Test Interface</h2>
        <p>Session ID: {sessionId?.slice(0, 12)}...</p>
      </div>

      <div className="test-tabs">
        <button
          className={`tab-button ${activeTab === 'api-tester' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-tester')}
        >
          🔌 API Tester
        </button>
        <button
          className={`tab-button ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          📊 System Status
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Response History
        </button>
        <button
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          ✓ Test Results
        </button>
      </div>

      <div className="test-content">
        {/* API Tester Tab */}
        {activeTab === 'api-tester' && (
          <div className="api-tester-section">
            <div className="control-panel">
              <div className="control-group">
                <label>Endpoint:</label>
                <select value={selectedEndpoint} onChange={(e) => setSelectedEndpoint(e.target.value)}>
                  {Object.keys(API_ENDPOINTS).map(ep => (
                    <option key={ep} value={ep}>{ep}</option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label>Method:</label>
                <select value={requestMethod} onChange={(e) => setRequestMethod(e.target.value)}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                </select>
              </div>

              {requestMethod === 'POST' && (
                <div className="control-group">
                  <label>Request Body (JSON):</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={4}
                  />
                </div>
              )}

              <div className="button-group">
                <button
                  onClick={testApiCall}
                  disabled={apiLoading}
                  className="btn btn-primary"
                >
                  {apiLoading ? 'Testing...' : '▶️ Send Request'}
                </button>
                <button
                  onClick={() => {
                    setApiResponse(null);
                    setRequestBody('');
                  }}
                  className="btn btn-secondary"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>

            {apiResponse && (
              <div className={`response-panel ${apiResponse.error ? 'error' : 'success'}`}>
                <h3>Response</h3>
                <div className="response-meta">
                  <span className={`status-badge ${apiResponse.status === 200 ? 'ok' : 'error'}`}>
                    {apiResponse.status}
                  </span>
                  <span className="timestamp">{apiResponse.timestamp}</span>
                </div>
                <pre className="response-body">
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* System Status Tab */}
        {activeTab === 'status' && (
          <div className="status-section">
            <div className="status-header">
              <h3>System Health Check</h3>
              <button onClick={checkSystemStatus} className="btn btn-primary">
                🔄 Refresh
              </button>
            </div>

            <div className="status-grid">
              {Object.entries(systemStatus).map(([service, status]) => (
                <div key={service} className={`status-card ${status.ok ? 'healthy' : 'unhealthy'}`}>
                  <div className="status-indicator">
                    <span className={`indicator ${status.ok ? 'green' : 'red'}`}></span>
                    <span className="service-name">{service}</span>
                  </div>
                  <div className="status-details">
                    <p className="status-code">
                      Status: <strong>{status.status}</strong>
                    </p>
                    {status.message && (
                      <p className="status-message">{status.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="test-all-button">
              <button onClick={runFullTest} className="btn btn-success">
                🚀 Run Full System Test
              </button>
            </div>
          </div>
        )}

        {/* Response History Tab */}
        {activeTab === 'history' && (
          <div className="history-section">
            <h3>Last 10 Responses</h3>
            {responseHistory.length === 0 ? (
              <p className="empty-message">No responses yet</p>
            ) : (
              <div className="history-list">
                {responseHistory.map((response, idx) => (
                  <div key={idx} className={`history-item ${response.error ? 'error' : 'success'}`}>
                    <div className="history-header">
                      <span className="history-endpoint">{response.endpoint}</span>
                      <span className="history-method">{response.method}</span>
                      <span className={`history-status ${response.status === 200 ? 'ok' : 'error'}`}>
                        {response.status}
                      </span>
                      <span className="history-time">{response.timestamp}</span>
                    </div>
                    <details className="history-details">
                      <summary>View Response</summary>
                      <pre>{JSON.stringify(response.data, null, 2)}</pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test Results Tab */}
        {activeTab === 'results' && (
          <div className="results-section">
            <div className="results-header">
              <h3>Test Results</h3>
              <span className="results-count">{testResults.length} tests run</span>
              <button onClick={() => setTestResults([])} className="btn btn-secondary">
                Clear Results
              </button>
            </div>

            {testResults.length === 0 ? (
              <p className="empty-message">No test results yet. Run some tests to see results here.</p>
            ) : (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Endpoint</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Result</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result) => (
                      <tr key={result.id} className={result.success ? 'success' : 'error'}>
                        <td>{result.timestamp}</td>
                        <td>{result.endpoint}</td>
                        <td>{result.method}</td>
                        <td className={`status-code ${result.status === 200 ? 'ok' : 'err'}`}>
                          {result.status}
                        </td>
                        <td>{result.success ? '✓ PASS' : '✗ FAIL'}</td>
                        <td>{result.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TestInterface;
