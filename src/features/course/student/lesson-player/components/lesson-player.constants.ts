export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";
export const SUCCESS = "#22C55E";

export const LP_SHIMMER = `
  @keyframes lp-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  .lp-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 800px 100%;
    animation: lp-shimmer 1.8s ease-in-out infinite;
  }
  .lp-two-col {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .lp-main-col {
    flex: 1;
    min-width: 0;
  }
  .lp-curriculum-col {
    width: 300px;
    flex-shrink: 0;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
  }
  @media (max-width: 900px) {
    .lp-two-col {
      flex-direction: column !important;
    }
    .lp-main-col {
      order: 1;
      width: 100%;
    }
    .lp-curriculum-col {
      order: 2;
      width: 100% !important;
      position: static !important;
      max-height: none !important;
    }
  }
`;
