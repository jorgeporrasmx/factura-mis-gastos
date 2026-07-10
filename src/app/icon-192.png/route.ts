// Sirve /icon-192.png con el logotipo de Factura Mis Gastos embebido.
// Solucion temporal libre de binarios: reemplazar por el archivo real en
// public/ cuando se pueda hacer push de binarios (ver PR #74).
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const DATA_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAFf0lEQVR4nO3c0W0bSRBF0dLCITgGR+awHJljcA7cD2MgmeRIM5zu" +
  "rlf17vlZ7I9BdNWdHhmU32632y0AU/9lfwAgEwHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHAGgHA" +
  "GgHAGgHAGgHA2rfsD9DZj59/Lv8Zv399H/BJsOeNfxXiuhGLfhZhjEEAJ2Us+1FEcR4BHKC89HuI4RgC2FFx6fcQwz4CuNNp8e8R" +
  "wiMCiN5Lv4cY/rIOwHHx77mHYBkAi//INQSrAFj8r7mFYPNVCJb/GLdzan8DuA10JIfboG0ALP44nUNo+QrE8o/V+TzbBdB5WJm6" +
  "nmubV6CuA1LU6ZWoxQ3A8q/V6bzLB9BpGJV0OffSAXQZQlUdzr/kzwAdDr6bqj8XlLsBWH5NVedSKoCqh+yi4nzKBFDxcB1Vm1OJ" +
  "AKodqrtK85IPoNJh4l2VuckHAMwkHUCVpwieqzA/2QAqHB6+pj5HyQDUDw3nKM9TLgDlw8LrVOcqFwCwklQAqk8JjKE4X5kAFA8H" +
  "46nNWSIAtUPBXErzlggAyJIegNLTAOuozD09ACBT6m+EqTwFqv420yiZc8g++7QbQGX5kSt7D3gFgrWUALKrh5bMfeAGgLXlAfD0" +
  "xzNZe8ENAGtLA+Dpj89k7Ac3AKwRAKwtC4DXHxyxek+4AWBtSQA8/XHGyn3hBoA1AoC16QHw+oNXrNobbgBY+5b9Abrhxqtl6g3A" +
  "MuCKFfvDKxCsEQCsEQCsEQCsTQuAH4Axwuw94gaANQKANQKANQKANQKAtSkB8DdAGGnmPnEDwBrfBh1s5T/3zU17HTcArBEArBEA" +
  "rBEArBEArBEArBEArBEArBEArBEArBEArBEArPFluMEqf0Ht96/vpT//K7gBEBHv32Jd+W1WBVMCcDvE6u7npTa/mZ+HG8Dc3nKp" +
  "RTALARj7askdIiAAU0eXu3sEBGDozFJ3/1shAjDD8v9rWgDdr86KKi7/7D3iBjBRcflXIAADLP8+AmiO5f8cATTG8n9tagD8IJyn" +
  "w/Kv2B9ugIY6LP8qBCBi1NOO5T9negC8Bn1t1FeROy3/qr3hBkg26qvInZZ/JQJINOqryCz/65YEwGvQo1FfRe64/Cv3hRsgwajl" +
  "7rj8qy0LgFvg3ZllHPGaVGn5V+8JN0CSKxF0Xf4MBJDolQhY/rGWBsBr0KMRr0NX/1wVGfvBDSBg9LJWXP4sywPgFnhu1NJWXf6s" +
  "veAGEHJ1easuf6aUALgF9r26xJWXP3MfuAEEnV3mysufLS0AboHPHV3q6sufvQdvt9vtlvkBqg9wto8L8uPnn4f/ryx7+SN4BZK3" +
  "Lfnef3FN+g0QwTAdKTz9I7gBYE4iAJWnAdZQmrdEABFah4J51OYsE0CE3uFgLMX5SgUArCYXgOJTAtepzlUugAjdw8JrlOcpGUCE" +
  "9qHhOPU5ygYQoX94+FyF+UkHAMwmH0CFpwgeVZmbfAARdQ4Tf1WaV4kAImodqrNqcyoTQES9w3VTcT6lAoioecgOqs5F4vcBXsXv" +
  "EeSruvibcjfAR9UPv7oO5186gIgeQ6ioy7mXDyCizzCq6HTepX8GeIafC+bptPibFjfARx2HpKDrubYLIKLvsLJ0Ps92r0D3eCV6" +
  "XefF37QPYEMIxzks/qblK9AzTkO9wu2cbG6Aj7gNHrkt/sYygA0h+C7+xjqAjWMI7ou/IYA7nWNg6R8RwI5OIbD4+wjggIoxsPTH" +
  "EMBJyjGw9OcRwAAZUbDsYxDARCPCYNHnIgBYs/kqBPAMAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAaAcAa" +
  "AcAaAcAaAcAaAcAaAcAaAcDa/2d3DwzF5qe0AAAAAElFTkSuQmCC";

export function GET() {
  return new NextResponse(Buffer.from(DATA_BASE64, "base64"), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
