# API Contract - Financial Data Frontend

This document defines the API endpoints required by the frontend application.
Currently, these endpoints are mocked on the frontend. Backend implementation is pending.

---

## Stock Indices

### GET /api/indices/

List all available stock indices.

**Response:**
```json
[
  {
    "id": 1,
    "symbol": "^WIG20",
    "name": "WIG 20",
    "stock_exchange": "GPW",
    "active": true
  },
  {
    "id": 2,
    "symbol": "^GSPC",
    "name": "S&P 500",
    "stock_exchange": "NYSE",
    "active": true
  }
]
```

---

### GET /api/indices/{symbol}/history

Get historical OHLCV data for a specific index.

**Path Parameters:**
- `symbol` (string): Index symbol (e.g., `^WIG20`, `^GSPC`)

**Query Parameters (optional):**
- `period` (string): Time period - `1m`, `3m`, `6m`, `1y`, `5y`, `max` (default: `1y`)

**Response:**
```json
{
  "symbol": "^WIG20",
  "name": "WIG 20",
  "data": [
    {
      "time": "2024-01-02",
      "open": 2450.12,
      "high": 2475.89,
      "low": 2440.50,
      "close": 2468.33,
      "volume": 125000000
    },
    {
      "time": "2024-01-03",
      "open": 2468.33,
      "high": 2480.15,
      "low": 2455.20,
      "close": 2472.45,
      "volume": 118000000
    }
  ]
}
```

---

## Stock Companies

### GET /api/stocks/prices/

Get latest prices for all active stock companies.

**Response:**
```json
[
  {
    "symbol": "CDR",
    "yahoo_symbol": "CDR.WA",
    "name": "CD Projekt",
    "stock_exchange": "GPW",
    "price": {
      "trading_date": "2024-01-15",
      "open": 185.50,
      "high": 188.90,
      "low": 184.20,
      "close": 187.30,
      "volume": 2500000,
      "change": 1.80,
      "change_percent": 0.97
    }
  },
  {
    "symbol": "PKN",
    "yahoo_symbol": "PKN.WA",
    "name": "PKN Orlen",
    "stock_exchange": "GPW",
    "price": {
      "trading_date": "2024-01-15",
      "open": 72.10,
      "high": 73.45,
      "low": 71.80,
      "close": 72.95,
      "volume": 3200000,
      "change": 0.85,
      "change_percent": 1.18
    }
  }
]
```

---

### GET /api/stocks/prices/{symbol}/history

Get historical OHLCV data for a specific stock company.

**Path Parameters:**
- `symbol` (string): Stock symbol (e.g., `CDR`, `PKN`)

**Query Parameters (optional):**
- `period` (string): Time period - `1m`, `3m`, `6m`, `1y`, `5y`, `max` (default: `1y`)

**Response:**
```json
{
  "symbol": "CDR",
  "name": "CD Projekt",
  "data": [
    {
      "time": "2024-01-02",
      "open": 180.00,
      "high": 185.50,
      "low": 178.30,
      "close": 184.20,
      "volume": 2800000
    },
    {
      "time": "2024-01-03",
      "open": 184.20,
      "high": 186.90,
      "low": 182.50,
      "close": 185.75,
      "volume": 2650000
    }
  ]
}
```

---

## Existing Endpoints (Already Implemented)

### GET /api/currencies/
List all available currencies.

### GET /api/rates/all
Get latest exchange rates for all currencies.

### GET /api/stock-companies/
List all stock companies (metadata only, no prices).

---

## Notes

- All datetime fields use ISO 8601 format
- Price values are decimal numbers with 4 decimal places
- Volume is represented as integer
- `change` and `change_percent` are calculated on the backend
- Mock data is currently used on the frontend until backend endpoints are implemented
