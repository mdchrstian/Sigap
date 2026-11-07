# 03 Auth API
ui: no

## Goal
Public users can register and log in with email + password and get JWTs; role-based
permission classes exist for later tickets; admins manage users and roles in Django admin.

## Requirements
- `POST /api/auth/register` `{email, password, full_name}` → 201 `{id, email, full_name, role}`.
  Role is always `public` (any `role` field in the body is ignored). Password runs Django
  validators (min 8). Duplicate email → 400 `{"email": [...]}`.
- `POST /api/auth/login` `{email, password}` → 200 `{access, refresh, user:{id,email,full_name,role}}`.
  Bad credentials → 401 `{"detail": "Email atau kata sandi salah."}`.
- `POST /api/auth/refresh` `{refresh}` → `{access}` (SimpleJWT TokenRefreshView).
- `GET /api/auth/me` (auth) → user object; `PATCH /api/auth/me` `{full_name}` only.
- SimpleJWT: access 30 min, refresh 7 days, `USER_ID_FIELD="id"`.
- `accounts/permissions.py`: `IsOfficer` (role officer or admin), `IsAdminRole` (role admin).
- Throttle: register 5/hour per IP, login 10/min per IP (DRF ScopedRateThrottle).
- Django admin: register User with list (email, full_name, role, is_active, date_joined),
  filters role/is_active, search email/full_name, editable role. Saving role=admin sets
  is_staff=True; role officer/public sets is_staff=False unless is_superuser.
- Error messages in Bahasa Indonesia.

## Touch
- `backend/accounts/{serializers.py,views.py,urls.py,permissions.py,admin.py}`
- `backend/accounts/tests/test_auth.py`
- `backend/config/settings.py` (SIMPLE_JWT, throttle rates only)

## Do not touch
- `backend/accounts/models.py` (User model is fixed by ticket 01), other apps

## Decisions
- Django + SimpleJWT, email as username. Officers/admins are created only via Django admin
  or `createsuperuser`; never via public register.
- Reporter identity is private: no endpoint here exposes other users.
