# Notifikasi Kelulusan Dalam Akaun

Notifikasi pengguna kini dijana terus daripada status profil; perkhidmatan e-mel tidak diperlukan.

Apabila admin menekan **Luluskan**:

1. `approval_status` ditukar kepada `approved`.
2. `access_level` ditukar kepada `premium`.
3. `approval_notified` ditukar kepada `false` untuk menghasilkan notifikasi belum dibaca.
4. Pengguna melihat titik notifikasi pada butang akaun dan mesej kelulusan selepas log masuk.
5. Pengguna boleh menekan **Tandakan notifikasi sudah dibaca**.

Fungsi ini disediakan oleh RPC berikut dalam `setup.sql`:

- `approve_registration(uuid)`
- `reject_registration(uuid)`
- `mark_approval_notification_read()`

Folder `functions/notify-payment` ialah peninggalan aliran bayaran terdahulu dan tidak diperlukan untuk proses pendaftaran/kelulusan akaun semasa.
