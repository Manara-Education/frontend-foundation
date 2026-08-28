export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";
export const SUCCESS = "#22C55E";

export const LP_SHIMMER = `
  @keyframes lp-spin {
    to { transform: rotate(360deg); }
  }
  .lp-spin {
    animation: lp-spin 0.9s linear infinite;
  }
  /*
    The completion control sits under the lesson body. Full width on a phone, where a button
    aligned to one side is harder to reach than one that spans the column.
  */
  @media (max-width: 640px) {
    .lp-complete-row {
      align-items: stretch !important;
    }
    .lp-complete-row > button,
    .lp-complete-row > span[role="status"] {
      width: 100%;
      justify-content: center;
    }
  }
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
