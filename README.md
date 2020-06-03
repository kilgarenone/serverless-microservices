# serverless-microservices

## Development

1.  ```
    git clone https://github.com/kilgarenone/serverless-microservices.git
    ```
2.  ```
    cd serverless-microservices
    ```
3.  ```
    npm run dev
    ```

## Testing

```
npm test
```

## API

### [Get all orders](<https://postwoman.io/?method=GET&url=https://4cirzad19a.execute-api.us-east-1.amazonaws.com&path=/dev/&headers=%5B%7B%22key%22:%22authority%22,%22value%22:%224cirzad19a.execute-api.us-east-1.amazonaws.com%22%7D,%7B%22key%22:%22pragma%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22cache-control%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22user-agent%22,%22value%22:%22Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/83.0.4103.61%20Safari/537.36%22%7D,%7B%22key%22:%22content-type%22,%22value%22:%22text/plain;charset=UTF-8%22%7D,%7B%22key%22:%22accept%22,%22value%22:%22*/*%22%7D,%7B%22key%22:%22origin%22,%22value%22:%22http://localhost:8009%22%7D,%7B%22key%22:%22sec-fetch-site%22,%22value%22:%22cross-site%22%7D,%7B%22key%22:%22sec-fetch-mode%22,%22value%22:%22cors%22%7D,%7B%22key%22:%22sec-fetch-dest%22,%22value%22:%22empty%22%7D,%7B%22key%22:%22referer%22,%22value%22:%22http://localhost:8009/%22%7D,%7B%22key%22:%22accept-language%22,%22value%22:%22en-US,en;q=0.9%22%7D%5D&rawParams=%7B%0A%20%20%22orderId%22:%20%22a009375af146-d619-4860-ac8b-d1ccdf2d01a2%22,%0A%20%20%22itemName%22:%20%22drab_purple_porpoise%22,%0A%20%20%22skuId%22:%20%22p9mtn%22,%0A%20%20%22qty%22:%202,%0A%20%20%22createdAt%22:%20%222020-06-02T05:58:43.724Z%22,%0A%20%20%22status%22:%200%0A%7D>)

### [Create an order](<https://postwoman.io/?method=POST&url=https://4cirzad19a.execute-api.us-east-1.amazonaws.com&path=/dev/&contentType=application/json&headers=%5B%7B%22key%22:%22authority%22,%22value%22:%224cirzad19a.execute-api.us-east-1.amazonaws.com%22%7D,%7B%22key%22:%22pragma%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22cache-control%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22user-agent%22,%22value%22:%22Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/83.0.4103.61%20Safari/537.36%22%7D,%7B%22key%22:%22content-type%22,%22value%22:%22text/plain;charset=UTF-8%22%7D,%7B%22key%22:%22accept%22,%22value%22:%22*/*%22%7D,%7B%22key%22:%22origin%22,%22value%22:%22http://localhost:8009%22%7D,%7B%22key%22:%22sec-fetch-site%22,%22value%22:%22cross-site%22%7D,%7B%22key%22:%22sec-fetch-mode%22,%22value%22:%22cors%22%7D,%7B%22key%22:%22sec-fetch-dest%22,%22value%22:%22empty%22%7D,%7B%22key%22:%22referer%22,%22value%22:%22http://localhost:8009/%22%7D,%7B%22key%22:%22accept-language%22,%22value%22:%22en-US,en;q=0.9%22%7D%5D&rawParams=%7B%0A%20%20%22orderId%22:%20%22a009375af146-d619-4860-ac8b-d1ccdf2d01a2%22,%0A%20%20%22itemName%22:%20%22drab_purple_porpoise%22,%0A%20%20%22skuId%22:%20%22p9mtn%22,%0A%20%20%22qty%22:%202,%0A%20%20%22createdAt%22:%20%222020-06-02T05:58:43.724Z%22,%0A%20%20%22status%22:%200%0A%7D>)

### [Cancel an order](<https://postwoman.io/?method=PUT&url=https://4cirzad19a.execute-api.us-east-1.amazonaws.com&path=/dev/&contentType=application/json&headers=%5B%7B%22key%22:%22authority%22,%22value%22:%224cirzad19a.execute-api.us-east-1.amazonaws.com%22%7D,%7B%22key%22:%22pragma%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22cache-control%22,%22value%22:%22no-cache%22%7D,%7B%22key%22:%22user-agent%22,%22value%22:%22Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/83.0.4103.61%20Safari/537.36%22%7D,%7B%22key%22:%22content-type%22,%22value%22:%22text/plain;charset=UTF-8%22%7D,%7B%22key%22:%22accept%22,%22value%22:%22*/*%22%7D,%7B%22key%22:%22origin%22,%22value%22:%22http://localhost:8009%22%7D,%7B%22key%22:%22sec-fetch-site%22,%22value%22:%22cross-site%22%7D,%7B%22key%22:%22sec-fetch-mode%22,%22value%22:%22cors%22%7D,%7B%22key%22:%22sec-fetch-dest%22,%22value%22:%22empty%22%7D,%7B%22key%22:%22referer%22,%22value%22:%22http://localhost:8009/%22%7D,%7B%22key%22:%22accept-language%22,%22value%22:%22en-US,en;q=0.9%22%7D%5D&rawParams=%7B%0A%20%20%22orderId%22:%20%22a009375af146-d619-4860-ac8b-d1ccdf2d01a1%22%0A%7D>)

## Resources

- https://github.com/kilgarenone/boileroom/

- https://github.com/mavi888/serverless-dynamo-basic-operations

- https://blog.neverendingqs.com/2019/07/01/serverless-websocket-example.html

- https://www.serverless.com/blog/serverless-express-rest-api/#adding-a-dynamodb-table-with-rest-like-endpoints

- https://github.com/vercel/micro/issues/16#issuecomment-193518395
