const API_URL = `${import.meta.env.VITE_API_URL}/api/tables`

class TableService {
  // Get table by QR slug (public)
  async getTableBySlug(slug) {
    const response = await fetch(`${API_URL}/by-slug/${slug}`)
    const data = await response.json()
    return data.data // Returns table with number, etc.
  }

  // Admin: Get all tables
  async getTables(token) {
    const response = await fetch(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    return data.data
  }

  // Admin: Create table
  async createTable(tableData, token) {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tableData)
    })
    
    const data = await response.json()
    return data.data
  }

  // Admin: Get QR code for table
  getTableQRUrl(tableId, token) {
    return `${API_URL}/${tableId}/qr?token=${token}`
  }
}

export default new TableService()