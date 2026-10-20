# First owner setup

1. Open https://igrow-learning-centre-os.onrender.com .
2. Open the [iGrow service in Render](https://dashboard.render.com/web/srv-dbbiaouq1p3s73cngaig/env).
3. In Environment, reveal and copy `BOOTSTRAP_TOKEN`. Keep it private; do not post it to GitHub or share it with parents.
4. Paste that token into the one-time owner setup form. Enter your name, email and a unique password of at least 12 characters.
5. After the owner account is created, remove the bootstrap token from Render or replace its value with an empty string. The database singleton also prevents a second owner setup.
6. Configure programs and batches, then families and students. Add staff and parent logins in Users & access. Every parent must be linked to the correct family.

There are no default credentials. No production owner account was created by the deployment agent. The owner chooses the password directly on the HTTPS site.

After setup, verify a real permitted entry survives refresh and a fresh login. The local test suite already checks restart/login persistence and family permissions; production authenticated verification remains pending the owner's first setup.
