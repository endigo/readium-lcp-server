package sign

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/tls"
	"errors"
)

type Signer interface {
	Sign(interface{}) (Signature, error)
}

type Signature struct {
	Certificate []byte `json:"certificate"`
	Hash        []byte `json:"hash"`
	Algorithm   string `json:"algorithm"`
}

type rsaSigner struct {
	key  *rsa.PrivateKey
	cert *tls.Certificate
}

func (s *rsaSigner) Sign(in interface{}) (sig Signature, err error) {
	plain, err := Canon(in)
	if err != nil {
		return
	}

	hashed := sha1.Sum(plain)
	res, err := rsa.SignPKCS1v15(rand.Reader, s.key, crypto.SHA1, hashed[:])
	if err != nil {
		return
	}

	sig.Hash = res
	sig.Algorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
	sig.Certificate = s.cert.Certificate[0]
	return
}

func NewSigner(certificate *tls.Certificate) (Signer, error) {
	switch k := certificate.PrivateKey.(type) {
	case *rsa.PrivateKey:
		return &rsaSigner{k, certificate}, nil
	}

	return nil, errors.New("Key type invalid")
}
