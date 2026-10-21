# Verify VAVI's Resend sending domain

The supplied Resend API key is valid. On 20 October 2026, Resend reported `vavitilestudio.com` as `not_started`; none of its three required DNS records resolved publicly. The domain uses Cloudflare nameservers (`justin.ns.cloudflare.com` and `nancy.ns.cloudflare.com`).

Open **Cloudflare → vavitilestudio.com → DNS → Records** and add these exact records. These are public DNS authentication values, not the Resend API key.

| Type | Name | Content / target | Proxy | TTL |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey` | Use the DKIM value below | Not applicable | Auto |
| CNAME | `rsend` | `rsend.forge.rmta.net` | DNS only | Auto |
| CNAME | `send` | `send.forge.rmta.net` | DNS only | Auto |

DKIM TXT content (one value, without adding quotation marks in Cloudflare):

```text
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDwwQVZFM8J2+br7HbUyGUCUk+xF1HeYy007oG2PrzCCtBNXVDiYr3ZdQRA6aVhVy/Z2GdqejzlRuMOvhja9o/DXrdPM1YQ3Th2BIv6ETJhmOPMqk8hqemjSiPkU2xg/q9vRp6bgLjMRU/QSkO/qfXsotkus47mIY/uDgW7rbFKCQIDAQAB
```

Then open [Resend Domains](https://resend.com/domains), select `vavitilestudio.com`, and start verification. The existing website records and mailbox MX records do not need to change. If a record with one of these exact names already exists, inspect it before replacing anything.

The records above came directly from Resend domain `9017afba-a807-48b5-b523-f0f157d7b264`. If that domain is recreated or its keys rotate, retrieve its current records instead of reusing this snapshot. Once verification succeeds, the configured sender can be `VAVI Tile Studio <info@vavitilestudio.com>` and the live delivery check can proceed.
