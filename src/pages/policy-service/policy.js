import { Helmet } from 'react-helmet-async';
// sections
import { PolicyView } from 'src/sections/policy-service';

// ----------------------------------------------------------------------

export default function PolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy</title>
      </Helmet>

      <PolicyView />
    </>
  );
}
