const ENQUEUED_ENDPOINT = "https://srddev-image-caption.hf.space/api/queue/push/";
const GET_PREDICT_ENDPOINT = "https://srddev-image-caption.hf.space/api/queue/status/";
const WS_ENDPOINT = "wss://albarji-mixture-of-diffusers.hf.space/queue/join";

const ENTRY_POINT_DATA_DATE = "2023-02-22";

const INITIAL_INPUT_1 = {
  [ENTRY_POINT_DATA_DATE]: { 
    data:  "initial" 
  },
};

const INITIAL_INPUT_2 = {
  "left-region": 8,
  "center-region": 8,
  "right-region": 8,
  "overlap-region": 256,
  "diffusion-steps": 15,
  "random-seed": 3927643,
};

module.exports = {
  ENQUEUED_ENDPOINT,
  GET_PREDICT_ENDPOINT,
  ENTRY_POINT_DATA_DATE,
  WS_ENDPOINT,
  INITIAL_INPUT_1,
  INITIAL_INPUT_2,
};
