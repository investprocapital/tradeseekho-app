import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Auth service. The proposal uses Clerk (Email + Google login).
/// Drop-in: add `clerk_auth` to pubspec, then replace the stubs below with
/// `ClerkAuth(...).authenticate(...)` and read the session for the user id.
/// The Next.js API keys progress/bookmarks to a `userId` — wire Clerk's user id
/// into the `X-User-Id` header in [ApiClient] to scope data per real user.
class AuthService {
  static final provider = Provider<AuthService>((ref) => AuthService());

  String _userId = 'local-learner'; // demo; replace with Clerk user id
  bool _signedIn = true; // demo

  bool get isSignedIn => _signedIn;
  String get userId => _userId;

  Future<void> signInWithEmail(String email, String password) async {
    // TODO: Clerk — ClerkAuth().authenticate(...).then((r) => _userId = r.user.id);
    _signedIn = true;
  }

  Future<void> signInWithGoogle() async {
    // TODO: Clerk Google OAuth flow.
    _signedIn = true;
  }

  Future<void> signOut() async {
    _signedIn = false;
  }
}
