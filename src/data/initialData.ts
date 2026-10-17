import { CellData, ExcelSheet, ExcelState, WordDocumentState } from '../types';

export const COURT_APPEAL_MEMO_HTML = `
  <div class="court-memo-document" style="line-height: 1.6;">
    <!-- ترويسة وعنوان المذكرة -->
    <div style="text-align: center; margin-bottom: 12px;">
      <p style="font-size: 18pt; font-weight: bold; margin: 0 0 4px 0;">بسم الله الرحمن الرحيم</p>
      <h1 style="font-size: 20pt; font-weight: 700; color: #1e3a8a; margin: 0 0 6px 0;">أمام محكمة التمييز الإبتدائية</h1>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #b45309; font-size: 13pt; margin-bottom: 6px;">
        <span>◈</span>
        <span style="font-size: 15pt; color: #1e3a8a;">❖</span>
        <span>◈</span>
      </div>
    </div>

    <!-- أطراف التوجيه والتحية -->
    <div style="margin-bottom: 12px; line-height: 1.6; font-size: 12.5pt;">
      <p style="margin: 2px 0; font-weight: bold;">المُدعي عليه أنس مسعد غالب</p>
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin: 2px 0; font-weight: bold;">
        <span>فضيلة الأخ رئيس محكمة التمييز الإبتدائية .....................................................</span>
        <span style="font-weight: bold; margin-right: 8px;">الأكرم</span>
      </div>
      <p style="margin: 6px 0 4px 0; font-weight: bold;">تحية طيبة وبعد ،</p>
    </div>

    <!-- بطاقة الموضوع الرسمية (صندوق الموضوع الأزرق المستدير) -->
    <div style="background-color: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 8px 14px; margin: 10px 0 12px 0; box-shadow: 0 1px 4px rgba(30, 58, 138, 0.05);">
      <div style="margin-bottom: 4px;">
        <span style="background-color: #1d4ed8; color: #ffffff; padding: 2px 12px; border-radius: 5px; font-weight: bold; font-size: 11pt; display: inline-block;">الموضوع:</span>
      </div>
      <p style="margin: 0; font-size: 11.5pt; color: #1e3a8a; line-height: 1.65; text-align: justify; font-weight: 500;">
        (الطلبات الموجهة إلى نائب رئيس محكمة التمييز بخصوص الفصل في القضية وتحرير الفصل في الاستئناف للائحة الإدعاء والمستترين الإجناب، بما في ذلك الموضوعات المتعلقة بالشركة واسمها وما يلي:
      </p>
    </div>

    <!-- البند 1 (أولاً: أزرق) -->
    <div style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background-color: #1d4ed8; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11pt; flex-shrink: 0;">1</span>
        <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 12px; border-radius: 5px; font-weight: bold; font-size: 11.5pt;">أولاً: في شأن الوقائع والطلبات:</span>
      </div>
      <ul style="margin: 2px 0 4px 0; padding-right: 22px; list-style-type: disc; font-size: 11.5pt; line-height: 1.6;">
        <li style="margin-bottom: 2px;">المدعي عليه يطالب في بهذا الدعوى برد مبلغ (21)، بدية الموت ، ترجمة أزواجه.</li>
        <li style="margin-bottom: 2px;">المطالبة بإلزام المدعى عليه بالكشف في النزول على ذمة المدعى عليه بمبلغ وقدره.</li>
      </ul>
    </div>

    <!-- البند 2 (ثانياً: أخضر) -->
    <div style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background-color: #15803d; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11pt; flex-shrink: 0;">2</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 2px 12px; border-radius: 5px; font-weight: bold; font-size: 11.5pt;">ثانياً: في شأن الفحص والتحري:</span>
      </div>
      <ul style="margin: 2px 0 4px 0; padding-right: 22px; list-style-type: disc; font-size: 11.5pt; line-height: 1.6;">
        <li style="margin-bottom: 2px;">تكليف ذوي الخبرة المقررة ، وعليه ثلاثين يوماً وفقاً للمادة المذكورة ، على أن يكون العمل من جهة مختصة ويسلم تقريراً في المدة المحددة.</li>
      </ul>
    </div>

    <!-- البند 3 (ثالثاً: بنفسجي) -->
    <div style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background-color: #7e22ce; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11pt; flex-shrink: 0;">3</span>
        <span style="background-color: #f3e8ff; color: #6b21a8; padding: 2px 12px; border-radius: 5px; font-weight: bold; font-size: 11.5pt;">ثالثاً: فيما يتعلق بالمستندات والطلبات الإضافية:</span>
      </div>
      <ul style="margin: 2px 0 4px 0; padding-right: 22px; list-style-type: disc; font-size: 11.5pt; line-height: 1.6;">
        <li style="margin-bottom: 2px;">إلزام المدعى عليه بتسليم المطلوبات والمستندات المتعلقة بالقضية.</li>
        <li style="margin-bottom: 2px;">إلزام المدعى عليه برد القيمة المحصلة والباقية المدفوعة ، والمدة الزائدة ، بالإضافة إلى ما يتعلق بأية مصاريف.</li>
      </ul>
    </div>

    <!-- البند 4 (رابعاً: برتقالي) -->
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background-color: #ea580c; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11pt; flex-shrink: 0;">4</span>
        <span style="background-color: #ffedd5; color: #9a3412; padding: 2px 12px; border-radius: 5px; font-weight: bold; font-size: 11.5pt;">رابعاً: في شأن الحكم والرسوم:</span>
      </div>
      <ul style="margin: 2px 0 4px 0; padding-right: 22px; list-style-type: disc; font-size: 11.5pt; line-height: 1.6;">
        <li style="margin-bottom: 2px;">الطالب بإلزام المدعى عليه بالرسوم والمصاريف وأتعاب المحاماة.</li>
      </ul>
    </div>

    <!-- الفاصل المنقط -->
    <div style="border-top: 1.5px dotted #93c5fd; margin: 10px 0 8px 0;"></div>

    <!-- صندوقا أطراف الدعوى والوكالة في الأسفل -->
    <div style="display: flex; gap: 14px; margin-top: 6px;">
      <!-- البطاقة اليمنى: مقدم الطلب / المدعي -->
      <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <div style="background-color: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 5px; font-weight: bold; text-align: center; margin-bottom: 6px; font-size: 10.5pt;">
          مقدم الطلب / المدعي:
        </div>
        <div style="line-height: 1.5; font-size: 10.5pt; text-align: center;">
          <p style="margin: 1px 0;">بنورية مسعد غالب</p>
          <p style="margin: 1px 0;">أمة الوفي مسعد غالب</p>
          <p style="margin: 1px 0;">تيسير مسعد غالب</p>
          <p style="margin: 1px 0;">محمد مسعد غالب</p>
          <p style="margin: 1px 0;">مهنة / مناش مسعد غالب ....</p>
        </div>
      </div>

      <!-- البطاقة اليسرى: المحامي / وكيلاً ومفوضا -->
      <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
        <div style="background-color: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 5px; font-weight: bold; text-align: center; margin-bottom: 6px; font-size: 10.5pt;">
          المحامي / وكيلاً ومفوضا
        </div>
        <div style="line-height: 1.5; font-size: 10.5pt; text-align: center;">
          <p style="margin: 1px 0;">وأماماً العامة أقرر بأنني عبد الله فالح</p>
          <p style="margin: 1px 0;">الرجاص، أمام محكمة التمييز، يوقعه الوكالة</p>
          <p style="margin: 1px 0;">المرفقة / المرفقة:</p>
          <p style="margin: 6px 0 1px 0; color: #64748b;">...................................................</p>
        </div>
      </div>
    </div>

    <!-- ================= الصفحة الثانية (Page 2) مطابق للمرفق ================= -->
    <div class="word-page-break" contenteditable="false" data-page-break="true" style="page-break-after: always; break-after: page; height: 0px; margin: 0px; padding: 0px; border: none; overflow: hidden; display: block;"></div>

    <!-- شارة رأس الصفحة 2: تابع موضوع الدعوى -->
    <div style="text-align: right; margin-bottom: 22px; padding-top: 10px;">
      <span style="background-color: #065f46; color: #ffffff; padding: 6px 24px; border-radius: 20px; font-weight: bold; font-size: 13pt; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(6, 95, 70, 0.2);">
        <span>🌿</span>
        <span>تابع موضوع الدعوى</span>
        <span>🌿</span>
      </span>
    </div>

    <!-- البند 5 (خامساً: أخضر) -->
    <div style="margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #15803d; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">5</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">خامساً: في شأن المرافعات والإجراءات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">الالتزام بمواعيد الجلسات المحددة من المحكمة.</li>
        <li style="margin-bottom: 5px;">تقديم كافة المستندات المطلوبة قبل موعد الجلسة بوقت كافٍ.</li>
        <li style="margin-bottom: 5px;">تمكين الخصوم من الاطلاع على ملف الدعوى، وفقاً للنظم المعمول بها.</li>
      </ul>
    </div>

    <!-- البند 6 (سادساً: بنفسجي) -->
    <div style="margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #7e22ce; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">6</span>
        <span style="background-color: #f3e8ff; color: #6b21a8; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">سادساً: في شأن التعويضات والطلبات المستقبلية:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">الطالب بإحالة الدعوى إلى اللجنة المختصة لتقدير التعويضات.</li>
        <li style="margin-bottom: 5px;">احتساب الفوائد القانونية من تاريخ المطالبة وحتى السداد.</li>
      </ul>
    </div>

    <!-- البند 7 (سابعاً: أزرق سماوي/تركواز) -->
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #0284c7; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">7</span>
        <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">سابعاً: ما يستجد من طلبات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">إضافة أي طلبات أخرى تراها المحكمة محققة للعدالة.</li>
      </ul>
    </div>

    <!-- ختام الدعوى وتوقيعات الصفحة 2 -->
    <div style="margin-top: 24px; border-top: 1.5px dotted #93c5fd; padding-top: 16px; text-align: center;">
      <p style="font-weight: bold; font-size: 13pt; color: #1e3a8a; margin: 6px 0 16px 0;">والله الموفق والمستعان وهو نعم المولى ونعم النصير ،،</p>
      
      <div style="display: flex; justify-content: space-between; gap: 20px; text-align: center; margin-top: 16px;">
        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt;">مقدمو الطلب / المدعون</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(البصمات والتوقيعات)</div>
          <div style="font-size: 11pt; color: #64748b;">تحريراً في: ___ / ___ / 1446هـ</div>
        </div>

        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt;">المحامي الوكيل والمفوض</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(التوقيع والختم المعتمد)</div>
          <div style="font-size: 11pt; color: #64748b;">رقم القيد النقابي: ____________</div>
        </div>
      </div>
    </div>
  </div>
`;

// Helper HTML snippets for inserting individual legal components from Ribbon
export const SNIPPETS_LEGAL = {
  page2ContinuationHeader: `
    <div style="text-align: right; margin-bottom: 20px; padding-top: 10px;">
      <span style="background-color: #065f46; color: #ffffff; padding: 6px 24px; border-radius: 20px; font-weight: bold; font-size: 13pt; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(6, 95, 70, 0.2);">
        <span>🌿</span>
        <span>تابع موضوع الدعوى</span>
        <span>🌿</span>
      </span>
    </div>
    <p><br></p>
  `,
  section5Green: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #15803d; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">5</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">خامساً: في شأن المرافعات والإجراءات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>الالتزام بمواعيد الجلسات المحددة من المحكمة...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  section6Purple: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #7e22ce; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">6</span>
        <span style="background-color: #f3e8ff; color: #6b21a8; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">سادساً: في شأن التعويضات والطلبات المستقبلية:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>الطالب بإحالة الدعوى إلى اللجنة المختصة لتقدير التعويضات...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  section7Cyan: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #0284c7; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">7</span>
        <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">سابعاً: ما يستجد من طلبات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>إضافة أي طلبات أخرى تراها المحكمة محققة للعدالة...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  pageBreak: `
    <div class="word-page-break"></div>
    <p><br></p>
  `,
  subjectCard: `
    <div style="background-color: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 12px 18px; margin: 16px 0; box-shadow: 0 2px 6px -1px rgba(30, 58, 138, 0.06);">
      <div style="margin-bottom: 6px;">
        <span style="background-color: #1d4ed8; color: #ffffff; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 11.5pt; display: inline-block;">الموضوع:</span>
      </div>
      <p style="margin: 0; font-size: 12.5pt; color: #1e3a8a; line-height: 1.85; text-align: justify; font-weight: 500;">
        (الطلبات الموجهة بخصوص الفصل في الدعوى والمسائل القانونية ذات الصلة:...
      </p>
    </div>
    <p><br></p>
  `,
  section1Blue: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #1d4ed8; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">1</span>
        <span style="background-color: #dbeafe; color: #1e40af; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">أولاً: في شأن الوقائع والطلبات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>بيان الوقائع والطلبات القانونية هنا...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  section2Green: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #15803d; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">2</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">ثانياً: في شأن الفحص والتحري:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>تكليف ذوي الخبرة المقررة وإعداد التقارير الفنية...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  section3Purple: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #7e22ce; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">3</span>
        <span style="background-color: #f3e8ff; color: #6b21a8; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">ثالثاً: فيما يتعلق بالمستندات والطلبات الإضافية:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>إلزام المدعى عليه بتسليم الأصول والمستندات...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  section4Orange: `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: #ea580c; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt;">4</span>
        <span style="background-color: #ffedd5; color: #9a3412; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">رابعاً: في شأن الحكم والرسوم:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li>المطالبة بالحكم النهائي والرسوم وأتعاب المحاماة...</li>
      </ul>
    </div>
    <p><br></p>
  `,
  partiesCards: `
    <div style="display: flex; gap: 16px; margin: 18px 0;">
      <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 10px; font-size: 11.5pt;">
          مقدم الطلب / المدعي:
        </div>
        <div style="line-height: 1.9; font-size: 12pt; color: #1e293b; text-align: center;">
          <p style="margin: 2px 0;">[اسم المدعي الأول]</p>
          <p style="margin: 2px 0;">[اسم المدعي الثاني]</p>
        </div>
      </div>
      <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 10px; font-size: 11.5pt;">
          المحامي / وكيلاً ومفوضا
        </div>
        <div style="line-height: 1.85; font-size: 12pt; color: #1e293b; text-align: center;">
          <p style="margin: 2px 0;">المحامي الوكيل / ................................</p>
          <p style="margin: 2px 0;">التوقيع: .......................................</p>
        </div>
      </div>
    </div>
    <p><br></p>
  `,
  dottedLine: `
    <div style="border-top: 2px dotted #93c5fd; margin: 20px 0 16px 0;"></div>
    <p><br></p>
  `,
  courtHilya: `
    <div style="text-align: center; color: #b45309; font-size: 14pt; margin: 12px 0;">
      <span>◈</span>
      <span style="font-size: 16pt; color: #1e3a8a; margin: 0 4px;">❖</span>
      <span>◈</span>
    </div>
    <p><br></p>
  `,
  courtHeader: `
    <div style="text-align: center; margin-bottom: 22px;">
      <p style="font-size: 20pt; font-weight: bold; font-family: 'Amiri', serif; color: #0f172a; margin: 0 0 6px 0;">بسم الله الرحمن الرحيم</p>
      <h1 style="font-size: 22pt; font-weight: 700; font-family: 'Amiri', serif; color: #1e3a8a; margin: 0 0 10px 0;">أمام محكمة التمييز الإبتدائية</h1>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #b45309; font-size: 14pt; margin-bottom: 8px;">
        <span>◈</span>
        <span style="font-size: 16pt; color: #1e3a8a;">❖</span>
        <span>◈</span>
      </div>
    </div>
    <p><br></p>
  `,
  closingSignatures: `
    <div style="margin-top: 24px; border-top: 1.5px dotted #93c5fd; padding-top: 16px; text-align: center;">
      <p style="font-weight: bold; font-size: 13pt; color: #1e3a8a; margin: 6px 0 16px 0;">والله الموفق والمستعان وهو نعم المولى ونعم النصير ،،</p>
      <div style="display: flex; justify-content: space-between; gap: 20px; text-align: center; margin-top: 16px;">
        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt; color: #1e293b;">مقدمو الطلب / المدعون</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(البصمات والتوقيعات)</div>
          <div style="font-size: 11pt; color: #64748b;">تحريراً في: ___ / ___ / 1446هـ</div>
        </div>
        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt; color: #1e293b;">المحامي الوكيل والمفوض</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(التوقيع والختم المعتمد)</div>
          <div style="font-size: 11pt; color: #64748b;">رقم القيد النقابي: ____________</div>
        </div>
      </div>
    </div>
    <p><br></p>
  `,
  page2FullContinuation: `
    <div class="word-page-break" contenteditable="false" data-page-break="true" style="page-break-after: always; break-after: page; height: 0px; margin: 0px; padding: 0px; border: none; overflow: hidden; display: block;"></div>
    <div style="text-align: right; margin-bottom: 20px; padding-top: 10px;">
      <span style="background-color: #065f46; color: #ffffff; padding: 6px 24px; border-radius: 20px; font-weight: bold; font-size: 13pt; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(6, 95, 70, 0.2);">
        <span>🌿</span>
        <span>تابع موضوع الدعوى</span>
        <span>🌿</span>
      </span>
    </div>
    <div style="margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #15803d; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">5</span>
        <span style="background-color: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">خامساً: في شأن المرافعات والإجراءات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">الالتزام بمواعيد الجلسات المحددة من المحكمة الموقرة.</li>
        <li style="margin-bottom: 5px;">تقديم كافة المستندات والمذكرات قبل موعد الجلسة بوقت كافٍ.</li>
        <li style="margin-bottom: 5px;">تمكين الخصوم من الاطلاع على ملف الدعوى وفقاً للنظم المقررة.</li>
      </ul>
    </div>
    <div style="margin-bottom: 18px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #7e22ce; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">6</span>
        <span style="background-color: #f3e8ff; color: #6b21a8; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">سادساً: في شأن التعويضات والطلبات المستقبلية:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">المطالبة بإحالة الدعوى إلى الجهة المختصة لتقدير التعويضات الجابرة للضرر.</li>
        <li style="margin-bottom: 5px;">احتساب الفوائد القانونية ومصروفات التقاضي من تاريخ المطالبة.</li>
      </ul>
    </div>
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="background-color: #0284c7; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">7</span>
        <span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 14px; border-radius: 6px; font-weight: bold; font-size: 12.5pt;">سابعاً: ما يستجد من طلبات:</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.9;">
        <li style="margin-bottom: 5px;">إضافة أي طلبات موضوعية أو إجرائية أخرى تراها المحكمة محققة للعدالة.</li>
      </ul>
    </div>
    <div style="margin-top: 24px; border-top: 1.5px dotted #93c5fd; padding-top: 16px; text-align: center;">
      <p style="font-weight: bold; font-size: 13pt; color: #1e3a8a; margin: 6px 0 16px 0;">والله الموفق والمستعان وهو نعم المولى ونعم النصير ،،</p>
      <div style="display: flex; justify-content: space-between; gap: 20px; text-align: center; margin-top: 16px;">
        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt; color: #1e293b;">مقدمو الطلب / المدعون</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(البصمات والتوقيعات)</div>
          <div style="font-size: 11pt; color: #64748b;">تحريراً في: ___ / ___ / 1446هـ</div>
        </div>
        <div style="flex: 1; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <div style="font-weight: bold; font-size: 12pt; color: #1e293b;">المحامي الوكيل والمفوض</div>
          <div style="height: 45px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 11pt;">(التوقيع والختم المعتمد)</div>
          <div style="font-size: 11pt; color: #64748b;">رقم القيد النقابي: ____________</div>
        </div>
      </div>
    </div>
    <p><br></p>
  `
};

export const generateCustomLegalSectionHtml = (num: string, title: string, colorHex: string = '#1d4ed8'): string => {
  return `
    <div style="margin: 14px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="background-color: ${colorHex}; color: #ffffff; width: 26px; height: 26px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12pt; flex-shrink: 0;">${num}</span>
        <span style="background-color: ${colorHex}18; color: ${colorHex}; border: 1px solid ${colorHex}33; padding: 3px 14px; border-radius: 6px; font-weight: bold; font-size: 12pt;">${title}</span>
      </div>
      <ul style="margin: 4px 0 8px 0; padding-right: 24px; list-style-type: disc; color: #1e293b; font-size: 12.5pt; line-height: 1.85;">
        <li style="margin-bottom: 4px;">أدخل تفاصيل هذا البند هنا...</li>
      </ul>
    </div>
    <p><br></p>
  `;
};

export const INITIAL_WORD_DOCUMENT: WordDocumentState = {
  title: '0 - مذكرة دعوى_محكمة التمييز الإبتدائية.doc',
  fontFamily: "'Amiri', serif",
  fontSize: 14,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isSubscript: false,
  isSuperscript: false,
  textColor: '#0f172a',
  highlightColor: 'transparent',
  textAlign: 'right',
  lineSpacing: 1.8,
  direction: 'rtl',
  margins: 'normal',
  orientation: 'portrait',
  paperSize: 'A4',
  columns: 1,
  zoom: 100,
  showRuler: true,
  showBorders: true,
  borderStyle: 'royal',
  borderColor: '#1e3a8a',
  borderWidth: 3,
  isReadingMode: false,
  showHeader: false,
  showFooter: false,
  headerText: 'مذكرة دعوى - أمام محكمة التمييز الإبتدائية',
  footerText: 'وفقاً للأحكام والأنظمة القضائية والشرعية المعمول بها.',
  pageNumbering: {
    enabled: true,
    position: 'bottom-center',
    format: 'page_x_of_y',
  },
  contentHtml: COURT_APPEAL_MEMO_HTML,
};

export const INITIAL_EXCEL_SHEETS: ExcelSheet[] = [
  {
    id: 'sheet-1',
    name: 'حصر التركات والمطالبات',
    rowCount: 45,
    colCount: 16,
    freezeRow: 1,
    freezeCol: 2,
    data: {
      // Row 1 - Header
      'A1': { value: 'م', bold: true, align: 'center', bg: '#15803d', color: '#ffffff' },
      'B1': { value: 'بيان المطالبة / الدين الشرعي', bold: true, align: 'center', bg: '#166534', color: '#ffffff' },
      'C1': { value: 'المستحق له', bold: true, align: 'center', bg: '#166534', color: '#ffffff' },
      'D1': { value: 'المبلغ المقدر (ريال)', bold: true, align: 'center', bg: '#166534', color: '#ffffff' },
      'E1': { value: 'الذهب (جرام عيار 21)', bold: true, align: 'center', bg: '#166534', color: '#ffffff' },
      'F1': { value: 'حالة التوثيق', bold: true, align: 'center', bg: '#166534', color: '#ffffff' },

      // Row 2
      'A2': { value: '1', align: 'center' },
      'B2': { value: 'قرضة ذهب بذمة المورث لزوجته', align: 'right' },
      'C2': { value: 'والدتنا نبات عبد الله', align: 'right' },
      'D2': { value: '0', format: 'currency_sar', align: 'left' },
      'E2': { value: '21.50', format: 'number', align: 'left' },
      'F2': { value: 'مثبت بإقرار الورثة', align: 'center' },

      // Row 3
      'A3': { value: '2', align: 'center' },
      'B3': { value: 'المهر المؤخر بذمة المورث', align: 'right' },
      'C3': { value: 'الزوجة نبات عبد الله', align: 'right' },
      'D3': { value: '5000000', format: 'currency_sar', align: 'left' },
      'E3': { value: '0.00', format: 'number', align: 'left' },
      'F3': { value: 'حجة نكاح شرعي', align: 'center' },

      // Row 4
      'A4': { value: '3', align: 'center' },
      'B4': { value: 'تكاليف علاج المورث والدفن', align: 'right' },
      'C4': { value: 'مناف وإخوانه', align: 'right' },
      'D4': { value: '850000', format: 'currency_sar', align: 'left' },
      'E4': { value: '0.00', format: 'number', align: 'left' },
      'F4': { value: 'سندات ومصروفات', align: 'center' },

      // Row 5
      'A5': { value: '4', align: 'center' },
      'B5': { value: 'تكاليف زواج القاصر أسوة بالمدعى عليه', align: 'right' },
      'C5': { value: 'الابن القاصر', align: 'right' },
      'D5': { value: '3000000', format: 'currency_sar', align: 'left' },
      'E5': { value: '0.00', format: 'number', align: 'left' },
      'F5': { value: 'تقدير عرفي وقضائي', align: 'center' },

      // Row 6
      'A6': { value: '5', align: 'center' },
      'B6': { value: 'أمانة أثمان شراء المكتسبات المحررة', align: 'right' },
      'C6': { value: 'جميع الورثة الشرعيين', align: 'right' },
      'D6': { value: '1800000', format: 'currency_sar', align: 'left' },
      'E6': { value: '0.00', format: 'number', align: 'left' },
      'F6': { value: 'بصائر ومحررات معتمدة', align: 'center' },

      // Row 7 - Totals
      'A7': { value: '∑', bold: true, align: 'center', bg: '#fef08a' },
      'B7': { value: 'إجمالي المبالغ والذهب الواجب إخراجها', bold: true, align: 'right', bg: '#fef08a' },
      'C7': { value: '-', align: 'center', bg: '#fef08a' },
      'D7': { value: '', formula: '=SUM(D2:D6)', bold: true, format: 'currency_sar', align: 'left', bg: '#fef08a' },
      'E7': { value: '', formula: '=SUM(E2:E6)', bold: true, format: 'number', align: 'left', bg: '#fef08a' },
      'F7': { value: 'معتمد للحسم قبل القسمة', bold: true, align: 'center', bg: '#fef08a' },
    }
  },
  {
    id: 'sheet-2',
    name: 'بيان المصاريف والتوثيق',
    rowCount: 30,
    colCount: 12,
    data: {
      'A1': { value: 'م', bold: true, align: 'center', bg: '#0284c7', color: '#ffffff' },
      'B1': { value: 'البند', bold: true, align: 'center', bg: '#0369a1', color: '#ffffff' },
      'C1': { value: 'القيمة التقديرية', bold: true, align: 'center', bg: '#0369a1', color: '#ffffff' },
      'D1': { value: 'الملاحظات', bold: true, align: 'center', bg: '#0369a1', color: '#ffffff' },

      'A2': { value: '1', align: 'center' },
      'B2': { value: 'رسوم المحكمة والتوثيق', align: 'right' },
      'C2': { value: '150000', format: 'currency_sar', align: 'left' },
      'D2': { value: 'سند رسمي', align: 'right' },

      'A3': { value: '2', align: 'center' },
      'B3': { value: 'أتعاب الخبير العدلي الهندسي', align: 'right' },
      'C3': { value: '200000', format: 'currency_sar', align: 'left' },
      'D3': { value: 'مخططات مساحية', align: 'right' },

      'A4': { value: 'المجموع', bold: true, align: 'center', bg: '#bae6fd' },
      'B4': { value: 'إجمالي الرسوم التقديرية', bold: true, align: 'right', bg: '#bae6fd' },
      'C4': { value: '', formula: '=SUM(C2:C3)', bold: true, format: 'currency_sar', align: 'left', bg: '#bae6fd' },
      'D4': { value: '', bg: '#bae6fd' },
    }
  }
];

export const INITIAL_EXCEL_STATE: ExcelState = {
  title: 'حصر_التركات_والمطالبات.xlsx',
  sheets: INITIAL_EXCEL_SHEETS,
  activeSheetId: 'sheet-1',
  selectedCell: 'B2',
  isEditing: false,
  formulaInput: '',
  zoom: 100,
};

// Aliases for convenience
export const initialWordDocument = INITIAL_WORD_DOCUMENT;
export const initialExcelData = INITIAL_EXCEL_STATE;
