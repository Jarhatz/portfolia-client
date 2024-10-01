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
> _This may take ~5 minutes to build_

3. Start the web client application.
```bash
docker run --rm -it -p 5173:5173 portfolia-client
```
> _The container is enabled to expose port 5173 by default, so please make sure that port is unused._

4. Open the development server link and start using Portfolia!
> _The React web application should be running on:_ [http://localhost:5173/](http://localhost:5173/)

==Sample Questions

What are key factors you consider when determining whether a stock is overvalued or undervalued?

What stocks in the commodity sectors should I invest in?

Should I invest in NVDA or do you think that it will reach a market cap within the next month?

Predict AAPL stocks for the next 6 months.

## Built With
- Bun
- React
- TypeScript + SWC
- HTML/CSS
