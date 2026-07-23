
/* essa parte é do cabeçalho do site */

const inputData = document.getElementById("eventDate");

          inputData.addEventListener("keypress", (e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          });

          inputData.addEventListener("input", (e) => {
            let valor = e.target.value;
            valor = valor.replace(/\D/g, "");

            if (valor.length > 2 && valor.length <= 4) {
              valor = valor.replace(/^(\d{2})(\d+)/, "$1/$2");
            } else if (valor.length > 4) {
              valor = valor.replace(/^(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
            }

            e.target.value = valor;

            // Garante que a alteração da data ative o alerta
            if (typeof markUnsaved === "function") {
              markUnsaved();
            }
          });

/* daqui em diante faz a parte do body */

const DEFAULT_CATS = {
        pre: [
          {
            tag: "01",
            title: "Planejamento & Contrato",
            collapsed: false,
            items: [
              "Briefing aprovado com o cliente",
              "Orçamento fechado e aprovado",
              "Contrato assinado (evento + fornecedores)",
              "Data e horários confirmados com a organização da feira",
              "Seguro de responsabilidade civil contratado",
            ],
          },
          {
            tag: "02",
            title: "Espaço & Estrutura do Stand",
            collapsed: false,
            items: [
              "Metragem e planta baixa aprovadas",
              "Projeto 3D / renderização aprovada pelo cliente",
              "ART/RRT do projeto emitida",
              "Mobiliário e depósito confirmados",
              "Elétrica dimensionada (ponto de força, quadro)",
              "Wi-fi / internet dedicada solicitada",
              "Piso, iluminação e sinalização definidos",
            ],
          },
          {
            tag: "03",
            title: "Fornecedores",
            collapsed: false,
            items: [
              "Montadora contratada e cronograma de montagem confirmado",
              "Gráfica (banners, testeiras, adesivos) com prazo de entrega",
              "Áudio, vídeo e iluminação cênica",
              "Catering / coffee break",
              "Segurança e brigadista",
              "Promotoras / recepcionistas contratadas",
            ],
          },
          {
            tag: "04",
            title: "Materiais & Marketing",
            collapsed: true,
            items: [
              "Brindes e materiais promocionais produzidos",
              "Catálogos, cartões de visita e mídia kit",
              "Uniformes da equipe",
              "Crachás e credenciamento da equipe",
              "Roll-ups, totens e telas digitais",
            ],
          },
          {
            tag: "05",
            title: "Equipe & Logística",
            collapsed: true,
            items: [
              "Escala de trabalho da equipe definida",
              "Treinamento da equipe (produto, discurso, sistema)",
              "Transporte e frete de materiais agendado",
              "Hospedagem e deslocamento da equipe (se aplicável)",
              "Estacionamento e acesso de carga definidos",
              "Lista de convidados VIP e agenda de reuniões",
            ],
          },
          {
            tag: "06",
            title: "Documentação & Aprovações",
            collapsed: true,
            items: [
              "Regulamento da feira lido e normas de montagem cumpridas",
              "Licenças e alvarás (se necessário)",
              "Seguro dos equipamentos",
              "Formulários e credenciais enviados à organização da feira",
            ],
          },
        ],
        dia: [
          {
            tag: "01",
            title: "Montagem (pré-abertura)",
            collapsed: false,
            items: [
              "Chegada da equipe no horário",
              "Conferência do stand vs. projeto aprovado",
              "Teste de energia e iluminação",
              "Teste de wi-fi / internet e equipamentos audiovisuais",
              "Materiais promocionais e brindes posicionados",
              "Limpeza final do stand",
              "Crachás e uniformes da equipe conferidos",
            ],
          },
          {
            tag: "02",
            title: "Abertura & durante o evento",
            collapsed: false,
            items: [
              "Equipe posicionada conforme a escala",
              "Sistema de captação de leads funcionando",
              "Reposição de brindes e materiais",
              "Monitoramento de energia e equipamentos",
              "Fotos e registro do stand em funcionamento",
              "Atendimento a visitantes VIP conforme agenda",
              "Ronda de segurança e limpeza periódica",
            ],
          },
          {
            tag: "03",
            title: "Encerramento & desmontagem",
            collapsed: true,
            items: [
              "Inventário de equipamentos conferido",
              "Devolução de materiais alugados",
              "Desmontagem conforme normas da feira",
              "Conferência de danos / avarias",
              "Transporte de volta agendado",
              "Avaliação pós-evento com a equipe",
              "Envio do relatório final ao cliente",
            ],
          },
        ],
      };

      let itemUid = 0;
      function nextId() {
        return "it" + Date.now().toString(36) + itemUid++;
      }

      function freshCats() {
        const clone = JSON.parse(JSON.stringify(DEFAULT_CATS));
        ["pre", "dia"].forEach((phase) => {
          clone[phase].forEach((cat) => {
            cat.items = cat.items.map((txt) => ({
              id: nextId(),
              text: txt,
              checked: false,
              note: "",
            }));
          });
        });
        return clone;
      }

      function cloneEventStructure(ev) {
        const copy = JSON.parse(JSON.stringify({ pre: ev.pre, dia: ev.dia }));
        ["pre", "dia"].forEach((phase) => {
          copy[phase].forEach((cat) => {
            cat.items = cat.items.map((it) => ({
              id: nextId(),
              text: it.text,
              checked: false,
              note: "",
            }));
          });
        });
        return copy;
      }

      let app = null;
      const STORAGE_KEY = "checklist-eventos-v2";
      let currentPhaseTab = "pre";
      let hasUnsavedChanges = false;

      // Funções para controle do alerta visual
      function markUnsaved() {
        hasUnsavedChanges = true;
        updateExportButtonUI();
      }

      function markSaved() {
        hasUnsavedChanges = false;
        updateExportButtonUI();
      }

      function updateExportButtonUI() {
        const btn = document.getElementById("btnExport");
        const badge = document.getElementById("unsavedBadge");

        if (hasUnsavedChanges) {
          btn.classList.add("export-alert");
          btn.innerHTML = "⚠️ Exportar .json (Salvar)";
          if (badge) badge.classList.add("show");
        } else {
          btn.classList.remove("export-alert");
          btn.innerHTML = "Exportar .json";
          if (badge) badge.classList.remove("show");
        }
      }

      // Alerta nativo do navegador ao tentar sair sem salvar
      window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = "";
        }
      });

      async function load() {
        try {
          const res = await window.storage.get(STORAGE_KEY, false);
          if (res && res.value) {
            app = JSON.parse(res.value);
          } else {
            throw new Error("no data");
          }
        } catch (e) {
          const id = "ev" + Date.now().toString(36);
          const cats = freshCats();
          app = {
            events: {
              [id]: { name: "", date: "", pre: cats.pre, dia: cats.dia },
            },
            activeId: id,
          };
        }
        renderAll();
      }

      async function save() {
        try {
          await window.storage.set(STORAGE_KEY, JSON.stringify(app), false);
          markUnsaved(); // Qualquer alteração ativa o aviso
        } catch (e) {
          console.error("storage error", e);
        }
      }

      function activeEvent() {
        return app.events[app.activeId];
      }

      function catStats(cat) {
        const total = cat.items.length;
        const done = cat.items.filter((i) => i.checked).length;
        return { total, done };
      }

      function phaseStats(phase) {
        let total = 0,
          done = 0;
        activeEvent()[phase].forEach((c) => {
          const s = catStats(c);
          total += s.total;
          done += s.done;
        });
        return { total, done };
      }

      function overallStats() {
        const a = phaseStats("pre"),
          b = phaseStats("dia");
        return { total: a.total + b.total, done: a.done + b.done };
      }

      function el(tag, cls, html) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html !== undefined) e.innerHTML = html;
        return e;
      }

      function renderPhase(phase) {
        const container = document.getElementById(
          phase === "pre" ? "phasePre" : "phaseDia",
        );
        container.innerHTML = "";
        activeEvent()[phase].forEach((cat) => {
          const s = catStats(cat);
          const catEl = el(
            "div",
            "category" + (cat.collapsed ? " collapsed" : ""),
          );

          const head = el("div", "cat-head");
          head.innerHTML = `
        <span class="cat-tag">${cat.tag}</span>
        <span class="cat-title">${cat.title}</span>
        <span class="cat-progress-track"><span class="cat-progress-fill${s.done === s.total && s.total > 0 ? " done" : ""}" style="width:${s.total ? (100 * s.done) / s.total : 0}%"></span></span>
        <span class="cat-count">${s.done}/${s.total}</span>
        <span class="chevron">&#9660;</span>
      `;
          head.addEventListener("click", () => {
            cat.collapsed = !cat.collapsed;
            save();
            renderPhase(phase);
          });
          catEl.appendChild(head);

          const body = el("div", "cat-body");
          cat.items.forEach((item) => {
            const row = el(
              "div",
              "item-row" + (item.checked ? " checked" : ""),
            );
            const box = el(
              "div",
              "checkbox" + (item.checked ? " checked" : ""),
            );
            box.addEventListener("click", (e) => {
              e.stopPropagation();
              item.checked = !item.checked;
              save();
              renderPhase(phase);
              renderHeader();
            });
            const main = el("div", "item-main");
            const text = el("div", "item-text", item.text);
            const note = document.createElement("input");
            note.type = "text";
            note.className = "item-note";
            note.placeholder = "Observação (opcional)";
            note.value = item.note || "";
            note.addEventListener("click", (e) => e.stopPropagation());
            note.addEventListener("input", (e) => {
              item.note = e.target.value;
              markUnsaved();
            });
            note.addEventListener("blur", () => save());
            main.appendChild(text);
            main.appendChild(note);

            const del = el("button", "item-del", "&times;");
            del.title = "Remover item";
            del.addEventListener("click", (e) => {
              e.stopPropagation();
              cat.items = cat.items.filter((i) => i.id !== item.id);
              save();
              renderPhase(phase);
              renderHeader();
            });
            row.appendChild(box);
            row.appendChild(main);
            row.appendChild(del);
            body.appendChild(row);
          });

          const addRow = el("div", "add-row");
          addRow.innerHTML = `<input type="text" placeholder="Adicionar item..." />`;
          const addBtn = el("button", null, "Adicionar");
          addRow.appendChild(addBtn);
          const input = addRow.querySelector("input");
          function commitAdd() {
            const v = input.value.trim();
            if (!v) return;
            cat.items.push({ id: nextId(), text: v, checked: false, note: "" });
            input.value = "";
            save();
            renderPhase(phase);
            renderHeader();
          }
          addBtn.addEventListener("click", commitAdd);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") commitAdd();
          });
          body.appendChild(addRow);

          catEl.appendChild(body);
          container.appendChild(catEl);
        });
      }

      function renderHeader() {
        const o = overallStats();
        const pct = o.total ? Math.round((100 * o.done) / o.total) : 0;
        document.getElementById("signalPct").textContent = pct + "%";
        const lamp = document.getElementById("signalLamp");
        lamp.classList.remove("amber", "green");
        if (pct >= 100 && o.total > 0) lamp.classList.add("green");
        else if (pct > 0) lamp.classList.add("amber");

        const pre = phaseStats("pre"),
          dia = phaseStats("dia");
        document.getElementById("countPre").textContent =
          `${pre.done}/${pre.total}`;
        document.getElementById("countDia").textContent =
          `${dia.done}/${dia.total}`;
      }

      function renderEventSelect() {
        const sel = document.getElementById("eventSelect");
        sel.innerHTML = "";
        Object.keys(app.events).forEach((id) => {
          const ev = app.events[id];
          const opt = document.createElement("option");
          opt.value = id;
          opt.textContent =
            ev.name && ev.name.trim() ? ev.name : "(evento sem nome)";
          if (id === app.activeId) opt.selected = true;
          sel.appendChild(opt);
        });
        document.getElementById("btnDeleteEvent").style.visibility =
          Object.keys(app.events).length > 1 ? "visible" : "hidden";
      }

      function renderAll() {
        document.getElementById("eventName").value = activeEvent().name || "";
        document.getElementById("eventDate").value = activeEvent().date || "";
        renderEventSelect();
        renderPhase("pre");
        renderPhase("dia");
        renderHeader();
        updateExportButtonUI();
      }

      document.getElementById("eventName").addEventListener("input", (e) => {
        activeEvent().name = e.target.value;
        save();
        renderEventSelect();
      });
      document.getElementById("eventDate").addEventListener("input", (e) => {
        activeEvent().date = e.target.value;
        save();
      });

      document
        .getElementById("tabPre")
        .addEventListener("click", () => switchTab("pre"));
      document
        .getElementById("tabDia")
        .addEventListener("click", () => switchTab("dia"));
      function switchTab(phase) {
        currentPhaseTab = phase;
        document
          .getElementById("tabPre")
          .classList.toggle("active", phase === "pre");
        document
          .getElementById("tabDia")
          .classList.toggle("active", phase === "dia");
        document
          .getElementById("phasePre")
          .classList.toggle("active", phase === "pre");
        document
          .getElementById("phaseDia")
          .classList.toggle("active", phase === "dia");
      }

      document.getElementById("eventSelect").addEventListener("change", (e) => {
        app.activeId = e.target.value;
        save();
        renderAll();
      });

      document.getElementById("btnNewEvent").addEventListener("click", () => {
        const form = document.getElementById("newEventForm");
        form.classList.add("show");
        document.getElementById("newEventNameInput").focus();
      });
      document
        .getElementById("btnCancelNewEvent")
        .addEventListener("click", () => {
          document.getElementById("newEventForm").classList.remove("show");
          document.getElementById("newEventNameInput").value = "";
        });
      document
        .getElementById("btnConfirmNewEvent")
        .addEventListener("click", createNewEvent);
      document
        .getElementById("newEventNameInput")
        .addEventListener("keydown", (e) => {
          if (e.key === "Enter") createNewEvent();
        });
      function createNewEvent() {
        const nameInput = document.getElementById("newEventNameInput");
        const name = nameInput.value.trim();
        const id =
          "ev" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
        const struct = cloneEventStructure(activeEvent());
        app.events[id] = {
          name: name,
          date: "",
          pre: struct.pre,
          dia: struct.dia,
        };
        app.activeId = id;
        nameInput.value = "";
        document.getElementById("newEventForm").classList.remove("show");
        save();
        renderAll();
      }

      document
        .getElementById("btnDeleteEvent")
        .addEventListener("click", () => {
          const ids = Object.keys(app.events);
          if (ids.length <= 1) return;
          const id = app.activeId;
          delete app.events[id];
          app.activeId = Object.keys(app.events)[0];
          save();
          renderAll();
        });

      // Exporta e limpa os avisos de alteração
      document.getElementById("btnExport").addEventListener("click", () => {
        const ev = activeEvent();
        const payload = JSON.stringify(ev, null, 2);
        const blob = new Blob([payload], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const slug = (
          ev.name && ev.name.trim() ? ev.name.trim() : "checklist-evento"
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        a.href = url;
        a.download = (slug || "checklist-evento") + ".json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        markSaved(); // Reseta o status visual para "salvo"
      });

      document.getElementById("btnImport").addEventListener("click", () => {
        document.getElementById("importFile").click();
      });
      document.getElementById("importFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (!parsed.pre || !parsed.dia) throw new Error("formato inválido");
            ["pre", "dia"].forEach((phase) => {
              parsed[phase].forEach((cat) => {
                cat.items = (cat.items || []).map((it) => ({
                  id: it.id || nextId(),
                  text: it.text || "",
                  checked: !!it.checked,
                  note: it.note || "",
                }));
              });
            });
            const id =
              "ev" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
            app.events[id] = {
              name: parsed.name || file.name.replace(/\.json$/i, ""),
              date: parsed.date || "",
              pre: parsed.pre,
              dia: parsed.dia,
            };
            app.activeId = id;
            save();
            renderAll();
            markSaved();
          } catch (err) {
            alert("Não consegui ler esse arquivo como checklist válido.");
          }
          e.target.value = "";
        };
        reader.readAsText(file);
      });

      load();
