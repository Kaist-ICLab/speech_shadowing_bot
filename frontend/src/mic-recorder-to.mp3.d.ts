// mic-recorder-to-mp3.d.ts
declare module 'mic-recorder-to-mp3' {
  interface MicRecorderOptions {
    bitRate: number;
  }

  interface StopResponse {
    getMp3: () => Promise<[BlobPart[], Blob]>;
  }

  export default class MicRecorder {
    constructor(options: MicRecorderOptions);
    start(): Promise<void>;
    stop(): Promise<StopResponse>;
  }
}