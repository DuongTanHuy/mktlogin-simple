import React from 'react';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';

import { useAuthContext } from 'src/auth/hooks';
import { useBalanceContext } from 'src/account-balance/context/balance-context';
import { isValidBase64 } from 'src/utils/profile';
import DuplicateDialog from './duplicate/duplicate-dialog';
import DeleteSingleDialog from './delete/delete-single-dialog';
import RenewSingleDialog from './renew/renew-single-dialog';
import TransferSingleDialog from './transfer/transfer-single-dialog';
import EditNameDialog from './quick-action/edit-name-dialog';
import EditNoteDialog from './quick-action/edit-note-dialog';
import EditProxyDialog from './quick-action/edit-proxy-dialog';
import EditUidDialog from './quick-action/edit-uid-diallog';
import EditPasswordDialog from './quick-action/edit-password-dialog';
import EditTwoFaDialog from './quick-action/edit-two-fa-dialog';
import EditEmailDialog from './quick-action/edit-email-dialog';
import EditEmailPassDialog from './quick-action/edit-email-pass-dialog';
import EditEmailRecoveryDialog from './quick-action/edit-recovery-email-dialog';
import EditTokenDialog from './quick-action/edit-token-dialog';
import EditCookieDialog from './quick-action/edit-cookie-dialog';
import EditPhoneDialog from './quick-action/edit-phone-dialog';
import EditUsernameDialog from './quick-action/edit-username-diallog';
import SetSingleTagDialog from './tags/set-single-tag-dialog';
import DeleteSingleCookieDialog from './cookie/delete-single-cookie-dialog';
import MoveSingleDialog from './move-group/move-single-dialog';
import MoveSingleWorkspaceDialog from './workspace/move-single-workspace-dialog';
import DeleteSingleCacheDialog from './cache/delete-single-cache-dialog';

export default function RenderRowPopup({
  confirm,
  groupOption,
  profileInfo,
  handleResetData,
  quickActionId,
  quickActionData,
  setQuickActionData,
  quickEdit,
  resourceType,
}) {
  const { workspace_id } = useAuthContext();
  const { updateRefreshBalance } = useBalanceContext();
  const { id, name } = profileInfo;

  const handleUpdateProfileAfterEdit = (profileId, fieldName, data) => {
    const _clone = cloneDeep(quickActionData);
    const _find = _clone.findIndex((i) => i.id === profileId);
    if (fieldName === 'proxy_host') {
      _clone[_find].proxy_type = data.proxy_type;
      _clone[_find].proxy_port = data.proxy_port;
      _clone[_find].proxy_user = data.proxy_user;
      _clone[_find].proxy_password = data.proxy_password;
      _clone[_find].proxy_token = data.proxy_token;

      if (data.proxy_type === 'token' && data.proxy_token && isValidBase64(data.proxy_token)) {
        const proxy_token_decoded = atob(data.proxy_token);
        const proxy_arr = proxy_token_decoded.split(':');
        if (proxy_arr.length === 2) {
          const proxy_host_array = proxy_arr[0].split('-');
          if (proxy_host_array.length >= 1) {
            _clone[_find].proxy_host = proxy_host_array.pop();
          }
        }
      } else if (data.proxy_type !== 'token') {
        _clone[_find].proxy_host = data.proxy_host;
      }
    } else {
      _clone[_find][fieldName] = data;
    }
    setQuickActionData(_clone);
  };

  const handleUpdateResourceAfterEdit = (profileId, fieldName, data) => {
    const _clone = cloneDeep(quickActionData);
    const _find = _clone.findIndex((i) => i.id === profileId);
    if (_clone[_find].account_resources.length > 0) {
      _clone[_find].account_resources[0][fieldName] = data;
    } else {
      _clone[_find].account_resources.push({
        [fieldName]: data,
      });
    }

    setQuickActionData(_clone);
  };

  return (
    <>
      <DuplicateDialog
        open={confirm.value.duplicate}
        onClose={() => confirm.onFalse('duplicate')}
        id={id}
        name={name}
        workspaceId={workspace_id}
        handleResetData={handleResetData}
        handleReloadBalance={updateRefreshBalance}
      />
      <DeleteSingleCookieDialog
        open={confirm.value.deleteCookie}
        onClose={() => confirm.onFalse('deleteCookie')}
        id={id}
        workspaceId={workspace_id}
        handleResetData={handleResetData}
      />
      <DeleteSingleCacheDialog
        open={confirm.value.clearCache}
        onClose={() => confirm.onFalse('clearCache')}
        id={id}
        workspaceId={workspace_id}
        handleResetData={handleResetData}
      />
      <DeleteSingleDialog
        open={confirm.value.delete}
        onClose={() => confirm.onFalse('delete')}
        id={id}
        handleResetData={handleResetData}
        workspaceId={workspace_id}
      />
      <RenewSingleDialog
        open={confirm.value.renew}
        onClose={() => confirm.onFalse('renew')}
        id={id}
        workspaceId={workspace_id}
        handleResetData={handleResetData}
        handleReloadBalance={updateRefreshBalance}
      />

      <TransferSingleDialog
        open={confirm.value.send}
        onClose={() => confirm.onFalse('send')}
        id={id}
        handleResetData={handleResetData}
        workspaceId={workspace_id}
      />

      <MoveSingleDialog
        open={confirm.value.move}
        onClose={() => confirm.onFalse('move')}
        profileId={id}
        groupOption={groupOption}
        handleResetData={handleResetData}
      />
      <MoveSingleWorkspaceDialog
        open={confirm.value.switch_workspace}
        onClose={() => confirm.onFalse('switch_workspace')}
        profileId={id}
        handleReLoadData={handleResetData}
      />

      {/* Quick action */}
      {resourceType === 'profile' ? (
        <>
          <EditNameDialog
            profileName={quickActionData.find((item) => item.id === quickActionId)?.name}
            open={quickEdit.value.name}
            onClose={() => {
              quickEdit.onFalse('name');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateProfileAfterEdit}
          />

          <EditNoteDialog
            profileNote={quickActionData.find((item) => item.id === quickActionId)?.note || ''}
            open={quickEdit.value.note}
            onClose={() => {
              quickEdit.onFalse('note');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateProfileAfterEdit}
          />

          <SetSingleTagDialog
            profileTags={quickActionData.find((item) => item.id === quickActionId)?.tags || []}
            open={quickEdit.value.tags}
            onClose={() => {
              quickEdit.onFalse('tags');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateProfileAfterEdit}
          />

          <EditProxyDialog
            proxy={(() => {
              const result = quickActionData.find((item) => item.id === quickActionId);

              return result
                ? {
                    proxy_type: result.proxy_type,
                    proxy_host: result.proxy_host,
                    proxy_port: result.proxy_port,
                    proxy_user: result.proxy_user,
                    proxy_password: result.proxy_password,
                    proxy_token: result.proxy_token,
                  }
                : null;
            })()}
            open={quickEdit.value.proxy}
            onClose={() => {
              quickEdit.onFalse('proxy');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateProfileAfterEdit}
          />
        </>
      ) : (
        <>
          <EditUidDialog
            profileUid={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.uid || ''
            }
            open={quickEdit.value.uid}
            onClose={() => {
              quickEdit.onFalse('uid');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />
          <EditUsernameDialog
            profileUsername={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.username || ''
            }
            open={quickEdit.value.username}
            onClose={() => {
              quickEdit.onFalse('username');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditPasswordDialog
            profilePass={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.password || ''
            }
            open={quickEdit.value.password}
            onClose={() => {
              quickEdit.onFalse('password');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditTwoFaDialog
            profileTwoFa={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.two_fa || ''
            }
            open={quickEdit.value.twoFa}
            onClose={() => {
              quickEdit.onFalse('twoFa');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditEmailDialog
            profileEmail={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.email || ''
            }
            open={quickEdit.value.email}
            onClose={() => {
              quickEdit.onFalse('email');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditEmailPassDialog
            profileEmailPass={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.pass_email || ''
            }
            open={quickEdit.value.emailPass}
            onClose={() => {
              quickEdit.onFalse('emailPass');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditEmailRecoveryDialog
            profileEmailRecovery={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.mail_recovery || ''
            }
            open={quickEdit.value.emailRecovery}
            onClose={() => {
              quickEdit.onFalse('emailRecovery');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditTokenDialog
            profileToken={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.token || ''
            }
            open={quickEdit.value.token}
            onClose={() => {
              quickEdit.onFalse('token');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditCookieDialog
            profileCookie={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.cookie || ''
            }
            open={quickEdit.value.cookie}
            onClose={() => {
              quickEdit.onFalse('cookie');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />

          <EditPhoneDialog
            profilePhone={
              quickActionData.find((item) => item.id === quickActionId)?.account_resources?.[0]
                ?.phone || ''
            }
            open={quickEdit.value.phone}
            onClose={() => {
              quickEdit.onFalse('phone');
            }}
            profileId={quickActionId}
            handleUpdateAfterEdit={handleUpdateResourceAfterEdit}
            resourceType={resourceType}
          />
        </>
      )}
    </>
  );
}

RenderRowPopup.propTypes = {
  confirm: PropTypes.object,
  profileInfo: PropTypes.object,
  handleResetData: PropTypes.func,
  quickActionId: PropTypes.number,
  quickActionData: PropTypes.array,
  setQuickActionData: PropTypes.func,
  quickEdit: PropTypes.object,
  resourceType: PropTypes.string,
  groupOption: PropTypes.array,
};
