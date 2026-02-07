import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("contacts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");

  const isEditing = useMemo(() => editId !== null, [editId]);

  useEffect(() => {
    localStorage.setItem("contacts", JSON.stringify(items));
  }, [items]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setEditId(null);
  };

  const normalizeDigits = (s) => String(s ?? "").replace(/[^\d]/g, "");

  const formatTRPhone = (raw) => {
    const d = normalizeDigits(raw);
    if (!d) return "";
    const t = d.startsWith("90") ? d.slice(2) : d;
    const x = t.startsWith("0") ? t : `0${t}`;
    const a = x.slice(0, 4);
    const b = x.slice(4, 7);
    const c = x.slice(7, 9);
    const e = x.slice(9, 11);
    return [a, b, c, e].filter(Boolean).join(" ");
  };

  const telHref = (p) => `tel:${normalizeDigits(p)}`;
  const mailHref = (e) => `mailto:${String(e ?? "").trim()}`;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text ?? ""));
    } catch {
      const el = document.createElement("textarea");
      el.value = String(text ?? "");
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const addItem = () => {
    const n = name.trim();
    const e = email.trim();
    const p = formatTRPhone(phone).trim();
    if (!n || !e || !p) return;

    setItems([{ id: Date.now(), name: n, email: e, phone: p }, ...items]);
    resetForm();
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setName(t.name);
    setEmail(t.email);
    setPhone(t.phone);
  };

  const saveEdit = () => {
    const n = name.trim();
    const e = email.trim();
    const p = formatTRPhone(phone).trim();
    if (!n || !e || !p) return;

    setItems(items.map((t) => (t.id === editId ? { ...t, name: n, email: e, phone: p } : t)));
    resetForm();
  };

  const confirmDelete = (t) => {
    const ok = confirm(`${t.name} kaydını silmek istiyor musun?`);
    if (ok) {
      setItems(items.filter((x) => x.id !== t.id));
      if (editId === t.id) resetForm();
    }
  };

  const mainAction = () => (isEditing ? saveEdit() : addItem());

  const normalized = (s) => String(s ?? "").toLowerCase();

  const filtered = useMemo(() => {
    const q = normalized(query).trim();
    if (!q) return items;
    return items.filter((t) => normalized(`${t.name} ${t.email} ${t.phone}`).includes(q));
  }, [items, query]);

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "radial-gradient(900px 500px at 10% 10%, rgba(13,110,253,.14), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 20%, rgba(111,66,193,.14), transparent 60%)," +
          "linear-gradient(180deg, #f8f9fa, #eef1f5)",
      }}
    >
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container" style={{ maxWidth: 980 }}>
          <a className="navbar-brand fw-bold" href="#top" style={{ letterSpacing: ".2px" }}>
            Contact Manager
          </a>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <span
              className="badge rounded-pill"
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
              }}
            >
              {items.length} kayıt
            </span>
          </div>
        </div>
      </nav>

      <div className="container py-4" style={{ maxWidth: 980 }}>
        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="p-3 p-md-4 text-white"
                style={{
                  background: "linear-gradient(135deg, #0d6efd 0%, #6f42c1 70%, #198754 140%)",
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="fw-semibold">{isEditing ? "Kayıt Güncelle" : "Yeni Kayıt"}</div>
                  {isEditing && (
                    <span className="badge rounded-pill text-bg-warning text-dark">Düzenleme</span>
                  )}
                </div>
              </div>

              <div className="card-body p-3 p-md-4">
                <div className="row g-2">
                  <div className="col-12">
                    <input
                      className="form-control form-control-lg rounded-3"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="İsim"
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="form-control form-control-lg rounded-3"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail"
                    />
                  </div>
                  <div className="col-12">
                    <input
                      className="form-control form-control-lg rounded-3"
                      value={phone}
                      onChange={(e) => setPhone(formatTRPhone(e.target.value))}
                      placeholder="Telefon"
                      inputMode="tel"
                    />
                  </div>
                </div>

                <div className="row g-2 mt-3">
                  <div className="col d-grid">
                    <button
                      className="btn btn-lg rounded-3 fw-semibold text-white"
                      onClick={mainAction}
                      style={{
                        background: isEditing
                          ? "linear-gradient(135deg, #ffc107 0%, #ffb703 100%)"
                          : "linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)",
                        border: "0",
                        color: isEditing ? "#111" : "#fff",
                      }}
                    >
                      {isEditing ? "Güncelle" : "Ekle"}
                    </button>
                  </div>
                  <div className="col d-grid">
                    <button
                      className="btn btn-lg btn-outline-secondary rounded-3 fw-semibold"
                      onClick={resetForm}
                      disabled={!isEditing}
                    >
                      İptal
                    </button>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white">🔎</span>
                  <input
                    className="form-control"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ara (isim, mail, telefon)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="h5 fw-bold mb-0">Kayıtlar</div>
                  <span className="badge rounded-pill text-bg-secondary">
                    {filtered.length} sonuç
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <div className="display-6">📇</div>
                    <div className="fw-semibold mt-2">Kayıt yok</div>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filtered.map((t) => (
                      <div
                        key={t.id}
                        className={`list-group-item py-3 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between ${
                          editId === t.id ? "bg-warning bg-opacity-10" : ""
                        }`}
                      >
                        <div className="me-md-3">
                          <div className="fw-semibold fs-5">{t.name}</div>

                          <div className="small d-flex flex-wrap gap-2 align-items-center">
                            <a className="link-primary text-decoration-none" href={mailHref(t.email)}>
                              {t.email}
                            </a>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => copyText(t.email)}
                              style={{ padding: "2px 8px" }}
                            >
                              Kopyala
                            </button>
                          </div>

                          <div className="small d-flex flex-wrap gap-2 align-items-center mt-1">
                            <a className="link-primary text-decoration-none" href={telHref(t.phone)}>
                              {t.phone}
                            </a>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => copyText(t.phone)}
                              style={{ padding: "2px 8px" }}
                            >
                              Kopyala
                            </button>
                          </div>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(t)}>
                            Düzenle
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(t)}>
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-footer bg-white border-0 px-3 px-md-4 pb-3">
                <div className="d-flex justify-content-between align-items-center text-muted small">
                  <span></span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
