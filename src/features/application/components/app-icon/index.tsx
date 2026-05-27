import './index.scss';

export const AppIcon = (props: any) => {
  const { appIconUrl, appId } = props;

  const drawSvg = () => {
    return (
      <svg
        className="app-svg"
        viewBox="0 0 64 64"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <path
            d="M10.4,2.83712 C10.4,2.83712 17.9192,0 25.5268,0 C33.51088,0 41.6,2.83712 41.6,2.83712 C45.75272,4.8308 47.05272,6.09128 49.16392,10.4 C49.16392,10.4 52,17.02792 52,24.96 C52,32.62376 49.16392,41.6 49.16392,41.6 C47.17752,45.0528 45.90872,46.34552 41.6,49.16392 C41.6,49.16392 32.80992,52 24.58144,52 C17.26296,52 10.4,49.16392 10.4,49.16392 C5.69504,46.73344 5.37472,46.3216 2.83608,41.6 C2.83608,41.6 0,33.57432 0,25.54448 C0,17.98888 2.83608,10.4 2.83608,10.4 C4.43456,6.92328 6.214,4.71536 10.4,2.83712 Z"
            id={`path-${appId}`}
          ></path>
          <filter
            x="-19.2%"
            y="-15.4%"
            width="138.5%"
            height="138.5%"
            filterUnits="objectBoundingBox"
            id={`filter-${appId}`}
          >
            <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur
              stdDeviation="3"
              in="shadowOffsetOuter1"
              result="shadowBlurOuter1"
            ></feGaussianBlur>
            <feColorMatrix
              values="0 0 0 0 0.164705882   0 0 0 0 0.337254902   0 0 0 0 0.6  0 0 0 0.5 0"
              type="matrix"
              in="shadowBlurOuter1"
            ></feColorMatrix>
          </filter>
        </defs>
        <g id="VDI1.6终端改版2" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="位图" transform="translate(6.000000, 4.000000)">
            <mask id={`mask-${appId}`} fill="white">
              <use xlinkHref={`#path-${appId}`}></use>
            </mask>
            <g id="蒙版">
              <use
                fill="black"
                fillOpacity="1"
                filter={`url(#filter-${appId})`}
                xlinkHref={`#path-${appId}`}
              ></use>
              <use fill="#FFFFFF" fillRule="evenodd" xlinkHref={`#path-${appId}`}></use>
            </g>
            <image
              className="svg-image"
              mask={`url(#mask-${appId})`}
              x="-3"
              y="-3"
              xlinkHref={appIconUrl}
            ></image>
          </g>
        </g>
      </svg>
    );
  };

  return appIconUrl ? drawSvg() : null;
};
