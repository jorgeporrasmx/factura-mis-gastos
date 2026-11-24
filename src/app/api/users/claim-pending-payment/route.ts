import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Sesión requerida' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const auth = getAdminAuth();
    if (!db || !auth) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin no esta configurado' },
        { status: 500 }
      );
    }

    const identity = await auth.verifyIdToken(token, true).catch(() => null);
    if (!identity) {
      return NextResponse.json({ success: false, error: 'Sesión inválida' }, { status: 401 });
    }
    if (!identity.email || !identity.email_verified) {
      return NextResponse.json({ success: true, claimed: false });
    }

    const { uid } = identity;
    const email = normalizeEmail(identity.email);
    const displayName = identity.name || null;
    const photoURL = identity.picture || null;

    const pendingSnapshot = await db
      .collection('pending_users')
      .where('email', '==', email)
      .limit(1)
      .get();

    const now = FieldValue.serverTimestamp();

    const pendingDoc = pendingSnapshot.docs[0];
    const pending = pendingDoc?.data();
    if (!pending || pending.subscriptionStatus !== 'active' || !pending.lastPaymentTransactionId) {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          uid,
          email,
          displayName,
          photoURL,
          companyId: null,
          role: 'user',
          onboardingCompleted: false,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        });
      }

      return NextResponse.json({ success: true, claimed: false });
    }

    const companyId = String(pending.companyId || '');

    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName: displayName || pending.displayName || null,
      photoURL,
      companyId: companyId || null,
      companyName: pending.companyName || '',
      role: pending.role || 'admin',
      status: 'active',
      onboardingCompleted: true,
      accountType: pending.accountType || 'personal',
      whatsappPhone: pending.whatsappPhone || '',
      subscriptionStatus: pending.subscriptionStatus,
      plan: pending.plan || 'personal',
      driveFolderId: pending.driveFolderId || '',
      lastPaymentTransactionId: pending.lastPaymentTransactionId || '',
      createdAt: pending.createdAt || now,
      updatedAt: now,
      lastLoginAt: now,
    }, { merge: true });

    await pendingDoc.ref.set({
      claimed: true,
      claimedByUid: uid,
      claimedAt: now,
      updatedAt: now,
    }, { merge: true });

    if (companyId) {
      await db.collection('companies').doc(companyId).set({
        createdBy: uid,
        driveSharedWith: FieldValue.arrayUnion(email),
        updatedAt: now,
      }, { merge: true });
    }

    return NextResponse.json({
      success: true,
      claimed: true,
      companyId: companyId || null,
    });
  } catch (error) {
    console.error('[users/claim-pending-payment] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno',
      },
      { status: 500 }
    );
  }
}
