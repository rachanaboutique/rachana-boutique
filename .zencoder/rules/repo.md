# Repository Overview

This project is organized as a monorepo with a React client application and an Express/MongoDB server API.

## Client (d:\rachanaboutique\client)
- Built with **React 18** and **Vite**.
- Uses **Redux Toolkit** for state management and integrates UI components via Shadcn/Radix primitives.
- Tailwind CSS handles styling; additional utilities include `clsx`, `tailwind-merge`, and animation helpers.
- Contains custom admin and shop pages under `src/pages`, shared UI components in `src/components`, and configuration data in `src/config`.
- Build scripts generate and copy sitemap/robots assets before producing the production bundle in `dist/`.

## Server (d:\rachanaboutique\server)
- Node.js API implemented with **Express** and **MongoDB/Mongoose**.
- Provides admin, auth, and shop routes in `routes/`, backed by controllers and models in their respective folders.
- Handles media through Cloudinary (`helpers/cloudinary.js`) and email via Nodemailer.
- Development workflow uses `nodemon server.js`; production entrypoint is `server.js`.

## Environment & Utilities
- Environment variables managed separately for client (`client/.env`) and server (`server/.env`).
- Image management utilities exist on both client (custom upload components) and server (Cloudinary helpers).
- Ensure required API keys (Cloudinary, Razorpay, etc.) are set before running locally.