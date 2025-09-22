import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch('/api/swagger')
      .then(res => res.json())
      .then(data => setSpec(data));
  }, []);

  if (!spec) return <p>Cargando documentación…</p>;

  return <SwaggerUI spec={spec} />;
}
