import { expect } from 'chai';
import request from 'supertest';
import fs from 'node:fs';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import { orderFixture } from './helpers/orderFixture.js';

describe('Documentos de usuario', () => {
  it('guarda el PDF y sus metadatos', async () => {
    const body = await orderFixture();
    const response = await request(app)
      .post('/api/users/' + body.customer + '/documents')
      .field('type', 'user_document')
      .attach('document', 'tests/helpers/document.pdf');

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal('success');
    expect(response.body.payload.documents).to.have.lengthOf(1);

    const document = response.body.payload.documents[0];
    expect(document.mimeType).to.equal('application/pdf');
    expect(document.type).to.equal('user_document');
    expect(document.fileName).to.match(/\.pdf$/);
    expect(fs.existsSync(document.path)).to.equal(true);

    const saved = await UserModel.findById(body.customer);
    expect(saved.documents[0].fileName).to.equal(document.fileName);
  });

  it('rechaza una carga sin archivo', async () => {
    const body = await orderFixture();
    const response = await request(app)
      .post('/api/users/' + body.customer + '/documents')
      .field('type', 'user_document');

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal('error');
    expect(response.body.code).to.equal('FILE_REQUIRED');
    expect(response.body.message).to.equal('Debes adjuntar un archivo');

    const saved = await UserModel.findById(body.customer);
    expect(saved.documents).to.have.lengthOf(0);
  });

  it('rechaza un tipo de documento invalido y elimina el archivo', async () => {
    const body = await orderFixture()

    const response = await request(app)
      .post('/api/users/' + body.customer + '/documents')
      .field('type', 'tipo_invalido')
      .attach('document', 'tests/helpers/document.pdf')

    expect(response.status).to.equal(400)
    expect(response.body.status).to.equal('error')
    expect(response.body.code).to.equal('INVALID_DOCUMENT_TYPE')

    const saved = await UserModel.findById(body.customer)

    expect(saved.documents).to.have.lengthOf(0)

    const files = fs.readdirSync('uploads/test/documents')

    expect(files).to.have.lengthOf(0)
  })

});
