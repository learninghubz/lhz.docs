---
sidebar_position: 1
title: Quick Start
description: Get started with LearningHubz
---

# Quick Start Guide

This guide will help you get started with LearningHubz quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 18.0 or above
- **npm** or **yarn** package manager
- **Git** for version control

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/learninghubz/learninghubz2..0.git
cd learninghubz2..0
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the required environment variables:

```bash
# Azure Cosmos DB
COSMOS_DB_ENDPOINT=your_cosmos_endpoint
COSMOS_DB_KEY=your_cosmos_key

# Azure Search
AZURE_SEARCH_ENDPOINT=your_search_endpoint
AZURE_SEARCH_KEY=your_search_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# SignalR
SIGNALR_CONNECTION_STRING=your_signalr_connection
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
learninghubz2..0/
├── app/                 # Next.js App Router
│   ├── (authentication) # Auth routes
│   ├── (main)          # Main app routes
│   └── api/            # API routes
├── components/         # React components
├── lib/               # Utility libraries
├── hooks/             # Custom React hooks
├── services/          # API services
└── types/             # TypeScript types
```

## Next Steps

- [Architecture Overview](/docs/architecture/overview) - Learn about the system architecture
- [API Reference](/docs/api-reference) - Explore the REST API
- [Development Guidelines](/docs/development) - Follow our coding standards

## Need Help?

- Check the [main repository](https://github.com/learninghubz/learninghubz2..0) for issues and discussions
- Review the [full documentation](/docs/intro) for detailed guides
