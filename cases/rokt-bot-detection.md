# Rokt - Bot Detection

[Thiago Mata](../README.md)

| &nbsp;    | &nbsp;                                              |
|-----------|-----------------------------------------------------|
| Company:  | Rokt                                                |
| Position: | Senior Data Engineer                                |
| Summary:  | We developed the bot detection project to identify and block malicious bots that were affecting the company's revenue, the customer experience and the performance of the platform. |

##  Rokt

<div style="background-color: white; display: flex; justify-content: center; align-items: center; height: 100px;">
<img src="../img/rokt.svg" style="height:90px;"/>
</div>

---

Rokt is a technology company specializing in e-commerce marketing, providing personalized transaction moments to enhance customer engagement and revenue. As of 2023, Rokt has over 500 million users and is valued at approximately $2.4 billion. Rokt has partnership with notable companies as Uber, Ticketmaster, Fanatics and Live Nation.

I am working at Rokt as Senior Data Engineer for the last five years. My work consist in developing services in a high-performance, high-availability, and scalable platform that processes billions of transactions per month, to deliver personalized and relevant offers to millions of users worldwide.

## Protection Against Malicious Bots

| &nbsp; | &nbsp; |
|--------|--------|
| The bot detection project was developed to identify and block malicious bots that were affecting the company's revenue, the customer experience and the performance of the platform. This evaluation needs to be done in real-time, to avoid affecting the user experience. We also need to store the explanation of each decision as a way to audit the system. A rule engine needs to be developed to allow the company to create and evaluate new rules without affecting the customer experience. | <img width="1000px" src="../img/bot1.jpg"> |

## Impact

The Bot Detection project monitors all the public requests to the company's platform, identifying and blocking malicious bots in real-time. This project has a significant impact on the company's requests and revenue, as it blocks malicious bots that were creating many fake transactions, affecting client's campaigns performance. With the new reports, the company can detect new patterns, propose new rules, measure the impact of them, and keep improving the system.

## Technologies

- GoLang
- Istio
- Envoy Proxy
- WASM
- Kubernetes
- Kafka
- Snowflake
- Apache Superset

## Other Cases At Rokt

- [Conversion Attribution](./rokt-attribution.md)
- [Customer Identification](./rokt-identity.md)
