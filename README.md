# SCiGeoTracker

## Development server
1. Install backend dependencies:
    > npm install
1. Run backend development server:
    > SET DEBUG=scigeotracker:* & npm start
1. In another shell, enter frontend directory:
    > cd frontend
1. Run frontend development server:
    > npm run dev

> **_NOTE:_**   https://stackoverflow.com/questions/31773546/the-best-way-to-run-npm-install-for-nested-folders

## Production server
1. Install backend dependencies:
    > npm install
1. Enter frontend directory:
    > cd frontend
1. Install frontend dependencies:
    > npm install
1. Compile frontend:
    > npm run build
1. Re-enter project root directory:
    > cd ..
1. Run the Express server:
    > npm start
