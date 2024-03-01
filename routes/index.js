import express from 'express';
import fetch from 'node-fetch';
import { createAdminApiClient, createAdminRestApiClient } from '@shopify/admin-api-client';

const router = express.Router();

router.get('/api', async (req, res) => {
    const client = createAdminRestApiClient({
        storeDomain: "https://pocket-guide-audio-tours.myshopify.com",
        apiVersion: '2024-01',
        accessToken: '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'
    });

    //     const operation = `
    //   query ProductQuery($id: ID!) {
    //     product(id: $id) {
    //       id
    //       title
    //       handle
    //     }
    //   }
    // `;

    try {
        const order = await client.get('orders/5568446791836');
        console.log(order);
        if (order.ok) {
            const body = await order.json();
            console.log(body.order.line_items[0].properties);
        }
        // const { data, errors } = await client.request(operation, {
        //     variables: {
        //         id: 'gid://shopify/LineItem/12902292586652',
        //     },
        // });

        // console.log(data, errors);
    } catch (error) {
        console.error("Error fetching product details:", error);
        return res.status(400).json(error);
    }

    return res.json('www');
});


router.post('/api', (req, res) => {
    const postedData = req.body;

    console.log('posted data is', postedData);
    const authData = {
        "grant_type": "client_credentials",
        "client_id": "14b9e427-33d4-4dc6-88e3-36f793b68db5",
        "client_secret": "y_u8Q~UBWrBJjgVIaoUuAcZ2f8KvhtAwTjpltdeZ",
        "resource": "api://14b9e427-33d4-4dc6-88e3-36f793b68db5"
    }

    var formBody = [];
    for (var property in authData) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(authData[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('https://login.windows.net/6285e18b-e740-4114-8649-2d299e642afc/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
    })
        .then(res => res.json())
        .then(json => {
            postedData.line_items.map(item => {
                const tourSaleData = {
                    "name": postedData.name,
                    "emailaddress": postedData.email,
                    "source": postedData.source_name,
                    "number": postedData.number,
                    "walkingRouteShortName": item.sku,
                    "idealDetails": "WWqHTVbf2V",
                    "date": postedData.created_at,
                    "amountPaid": postedData.current_subtotal_price,
                    "currency": postedData.currency,
                    "language": postedData.customer_locale,
                    // "isAffiliate": false,
                    // "affiliateCode": "ABQEU",
                    // "affiliateControlCode": "e3f218b7a06f460287ab9d424536a698",
                    "culiWalkDate": item.properties[0].value,
                    "culiWalkRemarks": item.properties[1].value
                };

                fetch('https://positivebytes-pg-routes-api-dev.azurewebsites.net/positivebytes/pocketguide/tours/sale', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + json.access_token,
                        'X-TrackingId': postedData.id
                    },
                    body: JSON.stringify(tourSaleData)
                })
                    .then(res => res.json())
                    .then(tourSaleRes => {
                        console.log(tourSaleRes);
                        const campaignData = {
                            "tour": item.sku,
                            "emailaddress": postedData.email,
                            "camp": "kXatzmsi",
                            "source": postedData.source_name,
                            "code": "35519725aa4442929ec920c12b39afd9",
                            "serialnumber": "cGAHrGRC",
                            "language": postedData.customer_locale
                        }
                        fetch('https://positivebytes-pg-routes-api-dev.azurewebsites.net/positivebytes/pocketguide/tours/campaign', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + json.access_token,
                                'X-TrackingId': postedData.id
                            },
                            body: JSON.stringify(campaignData)
                        })
                            .then(res => res.json())
                            .then(campaignRes => {
                                console.log(campaignRes)
                                const affiliateData = {
                                    "tour": "CUR_OTB_CCW",
                                    "affcode": "ABQEU",
                                    "source": postedData.source_name,
                                    "code": "9103738e9e1d4b2c9aacd4c4d4960ebd",
                                    "serialnumber": "iHGbINla"
                                }
                                fetch('https://positivebytes-pg-routes-api-dev.azurewebsites.net/positivebytes/pocketguide/tours/affiliate', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer ' + json.access_token,
                                        'X-TrackingId': postedData.id
                                    },
                                    body: JSON.stringify(affiliateData)
                                })
                                    .then(res => res.json())
                                    .then(affiliateRes => {
                                        console.log(affiliateRes)
                                        fetch('https://positivebytes-pg-routes-api-dev.azurewebsites.net/positivebytes/pocketguide/tours/count', {
                                            method: 'GET',
                                            headers: {
                                                'Authorization': 'Bearer ' + json.access_token,
                                                'X-TrackingId': postedData.id
                                            }
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                console.log(data);
                                                const transactionData = {
                                                    "transactionId": "c4c9841f-f8aa-4b38-a422-8ba880e9aee9"
                                                };

                                                fetch('https://aois-tmg-dev.azurewebsites.net/api/OrdersCollector/transform', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'application/json',
                                                        'Authorization': 'Bearer ' + json.access_token
                                                    },
                                                    body: JSON.stringify(transactionData)
                                                })
                                                    .then(res => {
                                                        if (!res.ok) {
                                                            throw new Error('Network response was not ok');
                                                        }
                                                        // Check if response body exists
                                                        const contentType = res.headers.get('content-type');
                                                        if (contentType && contentType.includes('application/json')) {
                                                            return res.json();
                                                        } else {
                                                            throw new Error('Invalid JSON response');
                                                        }
                                                    })
                                                    .then(data => {
                                                        console.log(data);
                                                    })
                                                    .catch(err => {
                                                        console.error('Transaction Error:', err);
                                                    });


                                            })
                                            .catch(err => {
                                                console.error('Get Tour Error:', err);
                                            });
                                    })
                                    .catch(err => {
                                        console.error('Affilate Error:', err);
                                    });

                            })
                            .catch(err => {
                                console.error('Campaign Error:', err);
                            })
                    })
                    .catch(err => {
                        console.error('Tour Sale Error:', err);
                    })
            })
        })
});

export default router;
