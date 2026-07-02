import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uid = String(body.uid || '').trim();
    const email = normalizeEmail(String(body.email || ''));
    const displayName = body.displayName ? String(body.displayName) : null;
    const photoURL = body.photoURL ? String(body.photoURL) : null;

    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'uid y email son obligatorios' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin no esta configurado' },
        { status: 500 }
      );
    }

    const pendingSnapshot = await db
      .collection('pending_users')
      .where('email', '==', email)
      .limit(1)
      .get();

    const now = FieldValue.serverTimestamp();

    if (pendingSnapshot.empty) {
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

    const pendingDoc = pendingSnapshot.docs[0];
    const pending = pendingDoc.data();
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
      subscriptionStatus: pending.subscriptionStatus || 'active',
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
