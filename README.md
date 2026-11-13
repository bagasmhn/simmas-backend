<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Pendaftaran guru dan siswa

Hanya akun dengan role `ADMIN` yang dapat mendaftarkan guru/siswa atau
menambahkan perusahaan mitra. Login
terlebih dahulu melalui `POST /api/login`, lalu kirim token sebagai
`Authorization: Bearer <access_token>`.

- `POST /api/admin/guru` menerima `namalengkap`, `nip`, dan `jurusan`
  (`RPL`, `TKJ`, atau `MM`).
- `POST /api/admin/siswa` menerima `nama`, `nis`, dan `kelas`.
- `PATCH /api/admin/siswa/:id` hanya mengedit profil siswa dengan body
  `namalengkap`, `nis`, dan/atau `kelas`.
- `PATCH /api/admin/siswa/:id/status` mengubah status siswa; pilihan yang
  diterima `BELUM_MAGANG`, `SEDANG_MAGANG`, atau `LULUS`.
- `PATCH /api/admin/penempatan/:id` digunakan untuk plotting pertama maupun
  mengedit penempatan. Untuk plotting pertama, kirim `dudiId` dan
  `guruPembimbingId` bersama-sama; perusahaan harus terverifikasi dan guru
  harus aktif. `posisi` opsional dan default-nya `Peserta magang`. Contoh:

  ```json
  {
    "dudiId": 1,
    "guruPembimbingId": 1,
    "posisi": "Peserta magang"
  }
  ```

- `POST /api/admin/perusahaan` menerima `nama_perusahaan`, `alamat`,
  `bidang_usaha`, `kuota_peserta` (boolean), `penanggung_jawab`, dan `kontak`.
- `PATCH /api/admin/mitra/:id/verifikasi` mengubah status perusahaan menjadi
  `TERVERIFIKASI`.
- `GET /api/admin/penempatan` menampilkan penempatan siswa dengan status
  `SEDANG_MAGANG` atau `LULUS`. Data dapat difilter dengan `kelas`, `dudiId`,
  dan `status`.
- `PATCH /api/admin/penempatan/:id` mengubah `dudiId`, `guruPembimbingId`,
  dan/atau `posisi` penempatan siswa. ID pada URL adalah ID siswa. Jika siswa
  belum punya penempatan, endpoint ini membuat penempatan baru dan mengubah
  status siswa menjadi `SEDANG_MAGANG`.
- `PATCH /api/admin/penempatan/:id/status` menerima status `SEDANG_MAGANG` atau
  `LULUS`. Siswa yang sudah `LULUS` tidak dapat diubah statusnya lagi melalui
  endpoint penempatan; gunakan `PATCH /api/admin/siswa/:id/status` untuk koreksi.
- `DELETE /api/admin/penempatan/:id` menghapus penempatan siswa beserta relasi
  guru pembimbingnya, lalu mengembalikan status siswa ke `BELUM_MAGANG`. ID URL
  adalah ID siswa; data guru dan perusahaan tetap tersimpan.

- `GET /api/admin/mitra` menampilkan semua perusahaan; tambahkan query
  `?status=TERVERIFIKASI` atau `?status=MENUNGGU_VALIDASI` untuk memfilter.

Password akun guru dan siswa otomatis `password123` dan disimpan sebagai hash.
Email akun dibuat otomatis dari nama dalam huruf kecil tanpa spasi, dengan
akhiran `@simmas.sch.id` (contoh: `Budi Santoso` menjadi
`budisantoso@simmas.sch.id`). Jika email hasil nama sudah digunakan, sistem
menampilkan konflik email, bukan keliru menyatakan NIP/NIS sudah terdaftar.
Data perusahaan tidak memiliki password pada skema database.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
