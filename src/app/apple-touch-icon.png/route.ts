// Sirve /apple-touch-icon.png con el logotipo de Factura Mis Gastos embebido.
// Solucion temporal libre de binarios: reemplazar por el archivo real en
// public/ cuando se pueda hacer push de binarios (ver PR #74).
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const DATA_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAALQAAAC0CAYAAAA9zQYyAAAFCklEQVR4nO3dzXEbaQxFUcilEBSDI3NYikwxOAd6oeqS2BbJbn5/" +
  "eA/37GYxNge4gnpcpPxyuVwuAZj4tfoFAD0RNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQNKwQ" +
  "NKwQNKy8rn4BLn7/+dv073+8v3V6JbW98CHZc1rDPYvQzyHoB2YH/AiB30fQO9kCfoTArxF06EV8C3EXD9ol5L3KYZcM2jXkvYph" +
  "lwq6Ssh7lcIuEXTVkPcqhG0dNCH/zDlsy6AJ+RjHsO3ey0HMxznOyuZCOy5nJpdrbXGhibmdywzlg3ZZRAYOs5R95HAYfmaqjyCS" +
  "F5qYx1OdsVzQqoNWpDhrqaAVB6xObeYyQasN1onS7CWCVhqoK5UdpA9aZZAVKOwiddAKA6wm+07SBp19cJVl3k3KoDMPDJ+y7ihd" +
  "0FkHhf9l3FWqoDMOCPdl21mqoIFWaYLO9pWO4zLtLkXQmQaC52TZ4fKgswwC7TLscnnQQE9Lg87wFY2+Vu90WdCr/8Mxzsrd8sgB" +
  "K0s+U5jhOqt+Zu4Zq+a9YsZcaFiZHnSG64w5VuyaCw0rU4PmOtcze+dcaFiZFjTXua6Zu+dCw8qUoLnOmNUAFxpWhgfNdcZmRgtc" +
  "aFghaFgZGjSPG9gb3QQXGlYIGlZeV78AZTxS5TPsQrNs3DKyDR45YIWgYYWgYWVI0Dw/45FRjXChYYWgYYWgYYWgYYWgYaV70PwJ" +
  "B44a0QoXGlZ4c1KDWT+MkO96x3GhYYWgYYWgYYWgYYWgYYWgYYWgYYWgYYWgYYWgYYWgYYX3cjRQe4/Fx/ub3Gs+iwtdxPZGKve/" +
  "Qbd70O4DU7TfSZYdjXgdXGhzt6LJEnVvBG3sUbSOURO0qaOxukVN0IbOROr2px4EbaZyzBGDgnb7NqZCKeZRjXChTSjFPBJBGyDm" +
  "LwQtjpivDQua5+jxVGMe2QYXWpRqzKMR9AKtF4qYbyPoyVrf9UbM9w0Nmufoa63venOIeXQTXOhJWt/15hDzDAQ9Qeu73oj5uOFB" +
  "V3/saL3ATjHPaIELPdiZyFqesbPHPMuUoKtf6Weidot5VgNc6ElaLnWvX7eCaUFXv9IR/eNTiXnm7rnQk/WKUCXm2aYGzZX+1Bqj" +
  "Usyzd86FXuTZKJViXmF60FzpL2fjVIt5xa650IsdjVQt5lWWBM2VvraP9dE/K1i145fL5XJZ8RsrLmm0/U8HVf5poeWCjiBqVyu/" +
  "Ay99hubRw8/qnfI/hbCyPOjVX9HoJ8MulwcdkWMQaJNlhymCjsgzEJyXaXdpggZ6SBV0pq90HJNtZ6mCjsg3INyWcVfpgo7IOShc" +
  "y7qjlEFH5B0Ycu8mbdARuQdXVfadpA46Iv8AK1HYRfqgIzQG6U5lBxJBR+gM1JHS7GWCjtAarAu1mUsFHaE3YGWKs5YLOkJz0GpU" +
  "Z7z0Eys98KmXvlRD3khe6O/UF5CJwyzlg47wWMRqLjOUf+TY4xHkHJeQNxYX+ju3BY3kOCu7C/0d1/pnjiFvrIPeEPYn55A3JYLe" +
  "VA27QsibUkFvqoRdKeRNyaA3rmFXDHlTOuiNS9iVQ94Q9I5a3ER8jaAfyBY4Ad9H0CfNDpyAzyHoTlpDJ9w+CBpW7N7LgdoIGlYI" +
  "GlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlYIGlb+Afbj843ohyf4AAAAAElFTkSuQmCC";

export function GET() {
  return new NextResponse(Buffer.from(DATA_BASE64, "base64"), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
