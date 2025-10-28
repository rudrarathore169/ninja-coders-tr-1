const API_URL = `${import.meta.env.VITE_API_URL}/api/tables`;

class TableService {
  // Get table by QR slug (public)
  async getTableBySlug(slug) {
    const response = await fetch(`${API_URL}/by-slug/${slug}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch table');
    }

    const data = await response.json();
    return data.data; // Returns table with number, occupied status, etc.
  }

  // Admin: Get all tables
  async getTables(token) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Avoid sending Content-Type on simple GET requests (triggers unnecessary preflight)
    const response = await fetch(`${API_URL}`, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch tables');
    }

    const data = await response.json();
    return data.data;
  }

  // Admin: Create table
  async createTable(tableData, token) {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(tableData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to create table');
    }

    const data = await response.json();
    return data.data;
  }

  // Admin: Toggle table occupancy
  async toggleOccupancy(tableId, occupied, token) {
    const response = await fetch(`${API_URL}/${tableId}/occupancy`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ occupied })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update occupancy');
    }

    const data = await response.json();
    return data.data;
  }

  // Generate customer-facing QR URL (not the API endpoint!)
  getCustomerQRUrl(qrSlug) {
    const baseUrl = window.location.origin;
    // Provide the query-param style QR URL as many scanners/pastes use this format
    // This also remains compatible with the router which supports /m/:qrSlug
    return `${baseUrl.replace(/\/$/, '')}/customer/menu?table=${qrSlug}`;
  }
}

export default new TableService();