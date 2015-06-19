// get order status
curl -v -X "GET" "https://sandbox-api.uber.com/v1/requests/37686206-a459-4efc-a3b2-0798704ead92" \
  -H "Authorization: Bearer MsoGlWFV9Zi3egWNWd4E9csq6HxO9E"

// change status from "processing" to "accepted"
  curl -X "PUT" "https://sandbox-api.uber.com/v1/sandbox/requests/37686206-a459-4efc-a3b2-0798704ead92" \
  -H "Authorization: Bearer MsoGlWFV9Zi3egWNWd4E9csq6HxO9E" \
  -d "[{\"status\":\"accepted\"}]"

// create a virtual taxi???
  curl -X "PUT" "https://sandbox-api.uber.com/v1/sandbox/products/a1111c8c-c720-46c3-8534-2fcdd730040d" \
  -H "Authorization: Bearer MsoGlWFV9Zi3egWNWd4E9csq6HxO9E" \
  -d "{\"surge_multiplier\":2.2, \"drivers_available\":true}"