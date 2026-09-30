"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiCreateLead } from "../lib/api";
import { useMutation } from "../lib/hooks";
import type { LeadSource } from "../lib/types";
import { Modal, TextField } from "./ui";

/** Alta manual de un lead. El unico camino para meter contactos que no vengan de Facebook. */
export function AddLeadModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const create = useMutation(
    (input: { name: string; email: string | null; phone: string | null; source: LeadSource }) =>
      apiCreateLead(input),
    {
      onSuccess: (lead) => toast.success(`Added ${lead.name}`),
      onError: (message) => toast.error(message),
    }
  );

  function close() {
    setOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    // El backend exige source; "manual" es lo que distingue un lead creado desde
    // aqui de uno que Bring Facebook, y lo usa el reparto por origen del dashboard.
    const result = await create.run({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      source: "manual",
    });
    if (result) close();
  }

  return (
    <>
      <button type="button" className="ec-btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setOpen(true)}>
        <Plus size={14} />
        Add lead
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Add a lead manually"
        footer={
          <>
            <button type="button" className="ec-btn-secondary" onClick={close}>
              Cancel
            </button>
            <button
              type="button"
              className="ec-btn-primary"
              disabled={create.loading}
              onClick={() => void submit()}
            >
              {create.loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Add lead
            </button>
          </>
        }
      >
        <TextField label="Name" value={name} onChange={setName} placeholder="Jane Doe" required autoFocus />
        <TextField label="Email" value={email} onChange={setEmail} type="email" placeholder="jane@example.com" />
        <TextField label="Phone" value={phone} onChange={setPhone} placeholder="+1 555 0100" />
      </Modal>
    </>
  );
}
