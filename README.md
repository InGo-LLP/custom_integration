# InGo Custom integration

This repository contains reference implementations of our so called POST integration. Currently there is only `node.js` implementation.

Initial event configuration:
1. Choose where this integration HTTP server will run. This is going to Activator Widget `manual` parameter. For example: `https://example.com/a/b/c?some=parameter`. In techinical description i will refer this as `INTEGRATION_URL`. Path or query string is not required, they are presented they for example only. Please note that it MUST be valid URL.
2. Choose some random string. This is going to `Registration Platform Api Key` in event configuration page. In techinical description i will refer this as `SIGNATURE_KEY`. 
3. Choose how we should map personal fields to body parameters. This is going to `Registration URL mask` in event configuration page. It should look like query string or form body response. For example it could look like:
`id=%id%&firstName=%first_name%` this is not any requirement for parameter names, we will parse this string, and encode them when it is need.

Available personal fields:
* `%id%`                       => person id in our DB
* `%first_name%`               => person first name (could be empty)
* `%last_name%`                => person last name (could be empty)
* `%display_name%`             => person name. This is always field, usually it is person full name. But depending from socian network person used it could be some other string, suitable for display purpose. Always presented
* `%email%`                    => person email (could be empty)
* `%company%`                  => person company name of current or last job (could be empty)
* `%company_position%`         => person position of current or last job (could be empty)
* `%social_channel%`           => which social network was used (could be empty if not a social button)
* `%is_social_user%`           => true/false if user used social button
* `%external_registration_id%` => `external_registration_id` parameter of Activator widget
* `other`                      => `other` as is

# Technical description

So we have `INTEGRATION_URL` and `SIGNATURE_KEY`. When user click button at Activator widget we will get this user personal information from social network or manual fields. Next we are computing signature string.

```
SIGNATURE_STRING = HTTP_METHOD + INTEGRATION_URL_PATH_WITH_QUERY + PAYLOAD
```

`+` it is string concatenation.

* `HTTP_METHOD` is `POST`
* `INTEGRATION_URL_PATH_WITH_QUERY` is `/a/b/c?some=parameter` (ENCODED)
* `PAYLOAD` is a POST body (ENCODED). We use urlencoding for encoding personal information like id=1&first_name=Denis.

Please note `SIGNATURE_STRING` will contains ONLY ASCII symbols (because of encoding).

This is how we calculate signature for HTTP POST call:

```
SIGNATURE = HEX_ENCODE(HMAC_SHA256(SIGNATURE_STRING, SIGNATURE_KEY))
```

Now we are doing HTTP POST call to `INTEGRATION_URL`. We are adding value of `SIGNATURE` in `Authorization` header like so: `Bearer ${SIGNATURE}`. Body is encoded as `application/x-www-form-urlencoded`.

What is expected from implementation:
1. Implement HTTP POST endpoint which is accessible at `INTEGRATION_URL`. 
2. You can secure it by checking for `Authorization` header. Or you can skip this - it is up to you.
3. Parse and use body.
4. Return in response `Location` header which will contain next url for person to see. We ignore status code.
