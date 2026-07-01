import {
  createCompanyAdmin,
  updateCompanyAdmin,
  updateCompanyDriveFoldersAdmin,
  updateUserProfileAdmin,
  isInviteCodeAvailableAdmin,
} from '@/lib/firebase/firestore-admin';
import {
  createCompanyFolderStructure,
  createUserFolder,
  shareFolderWithUser,
} from '@/lib/google-drive';
import {
  duplicateBoardForCompany,
  isMondayBoardsConfigured,
} from '@/lib/monday-boards';
import {
  generateInviteCode,
  generateUniqueCompanyDomain,
  type Company,
  type UserProfile,
} from '@/types/company';

function displayNameFromEmail(email: string): string {
  return email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || email;
}

async function generateAvailableInviteCode(baseName: string): Promise<string> {
  const base = generateInviteCode(baseName) || 'personal';
  let inviteCode = base;
  let codeIsAvailable = await isInviteCodeAvailableAdmin(inviteCode);
  let suffix = 2;

  while (!codeIsAvailable) {
    inviteCode = `${base}-${suffix}`;
    codeIsAvailable = await isInviteCodeAvailableAdmin(inviteCode);
    suffix++;
  }

  return inviteCode;
}

export async function createPersonalOperationForUser(userProfile: UserProfile): Promise<{
  company: Company;
  userProfile: UserProfile;
  mondayBoardId?: string;
}> {
  if (!userProfile.email?.trim()) {
    throw new Error('La cuenta necesita un email para crear su operación personal.');
  }

  const email = userProfile.email.trim().toLowerCase();
  const personalName = (userProfile.displayName || displayNameFromEmail(email)).trim();
  const operationName = `${personalName} - Personal`;
  const domain = generateUniqueCompanyDomain(operationName, userProfile.uid);
  const inviteCode = await generateAvailableInviteCode(operationName);

  const company = await createCompanyAdmin({
    name: operationName,
    domain,
    adminEmail: email,
    adminUid: userProfile.uid,
    adminName: personalName,
    inviteCode,
  });

  const folderStructure = await createCompanyFolderStructure(operationName);
  await shareFolderWithUser(folderStructure.rootFolderId, email, 'writer');

  const userFolder = await createUserFolder(folderStructure.rootFolderId, personalName);
  await shareFolderWithUser(userFolder.folderId, email, 'writer');

  await updateCompanyDriveFoldersAdmin(
    company.id,
    folderStructure.rootFolderId,
    folderStructure.docsFolderId
  );

  await updateCompanyAdmin(company.id, {
    plan: userProfile.plan || 'personal',
    subscriptionStatus: userProfile.subscriptionStatus || 'none',
    status: 'active',
  });

  let mondayBoardId: string | undefined;
  if (isMondayBoardsConfigured()) {
    try {
      const boardResult = await duplicateBoardForCompany(operationName);
      mondayBoardId = boardResult.boardId;
      await updateCompanyAdmin(company.id, { mondayBoardId });
    } catch (mondayError) {
      console.error('[personal-operation] Error creando tablero Monday:', mondayError);
    }
  }

  const userUpdates = {
    email,
    displayName: personalName,
    companyId: company.id,
    companyName: operationName,
    role: 'admin' as const,
    driveFolderId: userFolder.folderId,
    status: 'active' as const,
    onboardingCompleted: true,
    accountType: 'personal' as const,
    plan: userProfile.plan || 'personal' as const,
    subscriptionStatus: userProfile.subscriptionStatus || 'none' as const,
  };

  await updateUserProfileAdmin(userProfile.uid, userUpdates);

  return {
    company: {
      ...company,
      driveFolderId: folderStructure.rootFolderId,
      driveDocsFolderId: folderStructure.docsFolderId,
      plan: userProfile.plan || 'personal',
      subscriptionStatus: userProfile.subscriptionStatus || 'none',
      status: 'active',
      mondayBoardId,
    },
    userProfile: {
      ...userProfile,
      ...userUpdates,
    },
    mondayBoardId,
  };
}
