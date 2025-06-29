import { Helmet } from 'react-helmet-async';
import { useGetPublishWorkflowDetail } from 'src/api/publish-workflow.api';
import { useAuthContext } from 'src/auth/hooks';
import { useParams } from 'src/routes/hooks';
// sections
import { MarketplaceDetailView } from 'src/sections/marketplace/view';

// ----------------------------------------------------------------------

export default function MarketplaceDetailPage() {
  const { app_version, workspace_id } = useAuthContext();
  const params = useParams();
  const detailId = params?.id;

  const { workflow, reload } = useGetPublishWorkflowDetail(detailId, workspace_id);

  const handleReloadWorkflowData = () => {
    reload();
  };

  return (
    <>
      <Helmet>
        <title>MKTLogin {app_version}</title>
      </Helmet>

      <MarketplaceDetailView currentData={workflow} reloadWorkflowData={handleReloadWorkflowData} />
    </>
  );
}
