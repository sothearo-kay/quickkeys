export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // Suppress requests to /.well-known/appspecific/com.chrome.devtools.json
  if (url.pathname.startsWith("/.well-known/appspecific/com.chrome.devtools.json")) {
    setResponseStatus(event, 204);
    return null;
  }
});
