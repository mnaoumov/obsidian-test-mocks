interface RequestUrlResponse {
  status: number;
  headers: Record<string, string>;
  arrayBuffer: ArrayBuffer;
  json: unknown;
  text: string;
}

type RequestUrlResponsePromise = Promise<RequestUrlResponse> & RequestUrlResponse;

export function requestUrl(_request: unknown): RequestUrlResponsePromise {
  const response: RequestUrlResponse = {
    status: 200,
    headers: {},
    arrayBuffer: new ArrayBuffer(0),
    json: null,
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
