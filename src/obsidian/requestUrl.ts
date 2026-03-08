interface RequestUrlResponse {
  arrayBuffer: ArrayBuffer;
  headers: Record<string, string>;
  json: unknown;
  status: number;
  text: string;
}

type RequestUrlResponsePromise = Promise<RequestUrlResponse> & RequestUrlResponse;

export function requestUrl(_request: unknown): RequestUrlResponsePromise {
  const response: RequestUrlResponse = {
    arrayBuffer: new ArrayBuffer(0),
    headers: {},
    json: null,
    status: 200,
    text: ''
  };
  const promise = Promise.resolve(response) as RequestUrlResponsePromise;
  promise.status = response.status;
  promise.headers = response.headers;
  promise.arrayBuffer = response.arrayBuffer;
  promise.json = response.json;
  promise.text = response.text;
  return promise;
}
