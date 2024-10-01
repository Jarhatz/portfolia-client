# Portfolia Client Web Application

## Instructions for Launching

1. Clone the repository
```bash
git clone https://github.com/Jarhatz/portfolia-client.git
cd portfolia-client
```   

2. Build the docker image with the Dockerfile present in the root directory of this repository.
```bash
docker build -t portfolia-client .
```

3. Start the web client application.
```bash
docker run --rm -it -p 5173:5173 portfolia-client
```
> The container is enabled to expose port 5173 by default, so please make sure that port is unused.

4. Open the development server link and start using Portfolia!
> The React web application should be running on: [http://localhost:5173/](http://localhost:5173/)

## Built With
- Bun
- React
- TypeScript + SWC
- HTML/CSS
