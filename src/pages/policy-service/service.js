import { Helmet } from 'react-helmet-async';
// sections
import { ServiceView } from 'src/sections/policy-service';

// ----------------------------------------------------------------------

export default function ServicePage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service</title>
      </Helmet>

      <ServiceView />
    </>
  );
}
