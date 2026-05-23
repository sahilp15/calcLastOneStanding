import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// 30 university-level series / convergence questions
// ---------------------------------------------------------------------------
const questions = [
  // =========================================================================
  // RATIO TEST (5 questions, difficulty 1–3)
  // =========================================================================
  {
    latex:
      '\\text{Determine whether } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{n^2}{2^n} \\text{ converges or diverges.}',
    options: [
      '\\text{Converges — Ratio Test: } L = \\tfrac{1}{2} < 1',
      '\\text{Diverges — Ratio Test: } L = 2 > 1',
      '\\text{Converges — } p\\text{-series with } p = 2',
      '\\text{Diverges — Comparison with harmonic series}',
    ],
    answer: '\\text{Converges — Ratio Test: } L = \\tfrac{1}{2} < 1',
    explanation:
      '\\lim_{n\\to\\infty}\\frac{a_{n+1}}{a_n} = \\lim_{n\\to\\infty}\\frac{(n+1)^2}{2^{n+1}}\\cdot\\frac{2^n}{n^2} = \\frac{1}{2}\\lim_{n\\to\\infty}\\!\\left(\\frac{n+1}{n}\\right)^{\\!2} = \\frac{1}{2} < 1 \\implies \\text{converges}',
    difficulty: 2,
    topic: 'ratio-test',
  },
  {
    latex:
      '\\text{Apply the Ratio Test to } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{n!}{3^n}.',
    options: [
      '\\text{Diverges — } L = \\infty > 1',
      '\\text{Converges — } L = 0 < 1',
      '\\text{Inconclusive — } L = 1',
      '\\text{Converges — integral test}',
    ],
    answer: '\\text{Diverges — } L = \\infty > 1',
    explanation:
      '\\frac{a_{n+1}}{a_n} = \\frac{(n+1)!}{3^{n+1}}\\cdot\\frac{3^n}{n!} = \\frac{n+1}{3} \\to \\infty \\implies \\text{diverges}',
    difficulty: 2,
    topic: 'ratio-test',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{n!}{n^n} \\text{ converge?}',
    options: [
      '\\text{Converges — Ratio Test: } L = e^{-1} < 1',
      '\\text{Diverges — } n! \\text{ grows faster than } n^n',
      '\\text{Converges — Comparison with } \\sum 1/n^2',
      '\\text{Inconclusive — } L = 1',
    ],
    answer: '\\text{Converges — Ratio Test: } L = e^{-1} < 1',
    explanation:
      '\\frac{a_{n+1}}{a_n} = \\frac{(n+1)!}{(n+1)^{n+1}}\\cdot\\frac{n^n}{n!} = \\left(\\frac{n}{n+1}\\right)^{\\!n} = \\left(1-\\tfrac{1}{n+1}\\right)^{\\!n} \\to e^{-1} \\approx 0.368 < 1',
    difficulty: 3,
    topic: 'ratio-test',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{3^n}{n \\cdot 4^n} \\text{ converge or diverge?}',
    options: [
      '\\text{Converges — Ratio Test: } L = \\tfrac{3}{4} < 1',
      '\\text{Diverges — terms do not tend to 0}',
      '\\text{Converges — } p\\text{-series}',
      '\\text{Inconclusive — Ratio Test gives } L = 1',
    ],
    answer: '\\text{Converges — Ratio Test: } L = \\tfrac{3}{4} < 1',
    explanation:
      '\\frac{a_{n+1}}{a_n} = \\frac{3^{n+1}}{(n+1)4^{n+1}}\\cdot\\frac{n\\cdot 4^n}{3^n} = \\frac{3n}{4(n+1)} \\to \\frac{3}{4} < 1 \\implies \\text{converges}',
    difficulty: 1,
    topic: 'ratio-test',
  },
  {
    latex:
      '\\text{Determine convergence of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(2n)!}{(n!)^2 \\, 4^n}.',
    options: [
      '\\text{Inconclusive — Ratio Test: } L = 1',
      '\\text{Converges — Ratio Test: } L = \\tfrac{1}{2}',
      '\\text{Diverges — terms grow without bound}',
      '\\text{Converges — comparison with geometric series}',
    ],
    answer: '\\text{Inconclusive — Ratio Test: } L = 1',
    explanation:
      '\\frac{a_{n+1}}{a_n} = \\frac{(2n+2)!}{((n+1)!)^2 4^{n+1}}\\cdot\\frac{(n!)^2 4^n}{(2n)!} = \\frac{(2n+1)(2n+2)}{4(n+1)^2} = \\frac{2n+1}{2(n+1)} \\to 1 \\implies \\text{inconclusive}',
    difficulty: 3,
    topic: 'ratio-test',
  },

  // =========================================================================
  // ROOT TEST (3 questions, difficulty 2–3)
  // =========================================================================
  {
    latex:
      '\\text{Apply the Root Test to } \\displaystyle\\sum_{n=1}^{\\infty} \\left(\\frac{2n+1}{3n-1}\\right)^{\\!n}.',
    options: [
      '\\text{Converges — Root Test: } L = \\tfrac{2}{3} < 1',
      '\\text{Diverges — Root Test: } L = \\tfrac{3}{2} > 1',
      '\\text{Converges — Ratio Test gives } L = 0',
      '\\text{Inconclusive — } L = 1',
    ],
    answer: '\\text{Converges — Root Test: } L = \\tfrac{2}{3} < 1',
    explanation:
      'L = \\lim_{n\\to\\infty}\\sqrt[n]{a_n} = \\lim_{n\\to\\infty}\\frac{2n+1}{3n-1} = \\frac{2}{3} < 1 \\implies \\text{converges}',
    difficulty: 2,
    topic: 'root-test',
  },
  {
    latex:
      '\\text{Use the Root Test on } \\displaystyle\\sum_{n=2}^{\\infty} \\frac{1}{(\\ln n)^n}.',
    options: [
      '\\text{Converges — } L = 0 < 1',
      '\\text{Diverges — } L = \\infty',
      '\\text{Inconclusive — } L = 1',
      '\\text{Converges — integral test comparison}',
    ],
    answer: '\\text{Converges — } L = 0 < 1',
    explanation:
      'L = \\lim_{n\\to\\infty}\\frac{1}{\\ln n} = 0 < 1 \\implies \\sum \\frac{1}{(\\ln n)^n} \\text{ converges}',
    difficulty: 2,
    topic: 'root-test',
  },
  {
    latex:
      '\\text{Determine convergence: } \\displaystyle\\sum_{n=1}^{\\infty} \\left(\\frac{n}{n+1}\\right)^{\\!n^2}.',
    options: [
      '\\text{Converges — Root Test: } L = e^{-1} < 1',
      '\\text{Diverges — terms approach 1}',
      '\\text{Converges — comparison with } \\sum e^{-n}',
      '\\text{Inconclusive — Root Test fails}',
    ],
    answer: '\\text{Converges — Root Test: } L = e^{-1} < 1',
    explanation:
      'L = \\lim_{n\\to\\infty}\\sqrt[n]{a_n} = \\lim_{n\\to\\infty}\\!\\left(\\frac{n}{n+1}\\right)^{\\!n} = \\lim_{n\\to\\infty}\\!\\left(1-\\tfrac{1}{n+1}\\right)^{\\!n} = e^{-1} < 1',
    difficulty: 3,
    topic: 'root-test',
  },

  // =========================================================================
  // COMPARISON / LIMIT COMPARISON TEST (4 questions, difficulty 2–3)
  // =========================================================================
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^2 + \\sin n} \\text{ converge?}',
    options: [
      '\\text{Converges — Limit Comparison with } \\sum 1/n^2',
      '\\text{Diverges — Comparison with harmonic series}',
      '\\text{Converges — Ratio Test: } L = 0',
      '\\text{Diverges — terms are too large}',
    ],
    answer: '\\text{Converges — Limit Comparison with } \\sum 1/n^2',
    explanation:
      '\\lim_{n\\to\\infty}\\frac{1/(n^2+\\sin n)}{1/n^2} = \\lim_{n\\to\\infty}\\frac{n^2}{n^2+\\sin n} = 1 > 0, \\text{ and } \\sum 1/n^2 \\text{ converges, so the series converges.}',
    difficulty: 2,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Apply Limit Comparison to } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{\\sqrt{n}}{n^2 - 1}.',
    options: [
      '\\text{Converges — Limit Comparison with } \\sum 1/n^{3/2}',
      '\\text{Diverges — Limit Comparison with } \\sum 1/n',
      '\\text{Converges — Direct Comparison with } \\sum 1/n^2',
      '\\text{Diverges — terms do not go to 0}',
    ],
    answer: '\\text{Converges — Limit Comparison with } \\sum 1/n^{3/2}',
    explanation:
      '\\frac{\\sqrt{n}/(n^2-1)}{1/n^{3/2}} = \\frac{n^2}{n^2-1} \\to 1 > 0. \\text{ Since } \\sum n^{-3/2} \\text{ converges } (p=3/2>1), \\text{ so does our series.}',
    difficulty: 2,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{n+1}{n^3 + 2n + 5} \\text{ converge?}',
    options: [
      '\\text{Converges — Limit Comparison with } \\sum 1/n^2',
      '\\text{Diverges — Limit Comparison with } \\sum 1/n',
      '\\text{Converges — Ratio Test}',
      '\\text{Diverges — Direct Comparison with harmonic series}',
    ],
    answer: '\\text{Converges — Limit Comparison with } \\sum 1/n^2',
    explanation:
      '\\lim_{n\\to\\infty}\\frac{(n+1)/(n^3+2n+5)}{1/n^2} = \\lim_{n\\to\\infty}\\frac{n^2(n+1)}{n^3+2n+5} = 1. \\text{ Since } \\sum 1/n^2 \\text{ converges, so does the series.}',
    difficulty: 2,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Determine convergence of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{\\ln n}{n^2}.',
    options: [
      '\\text{Converges — Comparison: } \\ln n < n^{1/2} \\text{ eventually}',
      '\\text{Diverges — } \\ln n \\text{ grows without bound}',
      '\\text{Inconclusive — Ratio Test gives } L = 1',
      '\\text{Diverges — Direct Comparison with harmonic series}',
    ],
    answer: '\\text{Converges — Comparison: } \\ln n < n^{1/2} \\text{ eventually}',
    explanation:
      '\\text{For large } n,\\; \\ln n < n^{1/2}, \\text{ so } \\frac{\\ln n}{n^2} < \\frac{1}{n^{3/2}}, \\text{ and } \\sum 1/n^{3/2} \\text{ converges } (p=3/2>1).',
    difficulty: 3,
    topic: 'comparison-test',
  },

  // =========================================================================
  // INTEGRAL TEST (3 questions, difficulty 2–4)
  // =========================================================================
  {
    latex:
      '\\text{Use the Integral Test on } \\displaystyle\\sum_{n=2}^{\\infty} \\frac{1}{n \\ln n}.',
    options: [
      '\\text{Diverges — } \\int_2^{\\infty}\\frac{dx}{x\\ln x} = \\infty',
      '\\text{Converges — integral equals } \\ln(\\ln 2)',
      '\\text{Converges — terms decrease to 0}',
      '\\text{Inconclusive — function is not decreasing}',
    ],
    answer: '\\text{Diverges — } \\int_2^{\\infty}\\frac{dx}{x\\ln x} = \\infty',
    explanation:
      '\\int_2^{\\infty}\\frac{dx}{x\\ln x} = \\Big[\\ln(\\ln x)\\Big]_2^{\\infty} = \\infty. \\text{ By the Integral Test, the series diverges.}',
    difficulty: 2,
    topic: 'integral-test',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} n\\,e^{-n^2} \\text{ converge?}',
    options: [
      '\\text{Converges — } \\int_1^{\\infty} x e^{-x^2}\\,dx < \\infty',
      '\\text{Diverges — exponential decay insufficient}',
      '\\text{Inconclusive — Integral Test requires monotone terms}',
      '\\text{Converges — Ratio Test: } L = 0',
    ],
    answer: '\\text{Converges — } \\int_1^{\\infty} x e^{-x^2}\\,dx < \\infty',
    explanation:
      '\\int_1^{\\infty} x e^{-x^2}dx = \\tfrac{1}{2}\\Big[-e^{-x^2}\\Big]_1^{\\infty} = \\tfrac{1}{2}e^{-1} < \\infty. \\text{ Integral Test confirms convergence.}',
    difficulty: 3,
    topic: 'integral-test',
  },
  {
    latex:
      '\\text{Apply the Integral Test to } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^2+1}.',
    options: [
      '\\text{Converges — } \\int_1^{\\infty}\\frac{dx}{x^2+1} = \\frac{\\pi}{4} < \\infty',
      '\\text{Diverges — similar to harmonic series}',
      '\\text{Converges — } p\\text{-series with } p = 2',
      '\\text{Inconclusive — denominator has extra constant}',
    ],
    answer: '\\text{Converges — } \\int_1^{\\infty}\\frac{dx}{x^2+1} = \\frac{\\pi}{4} < \\infty',
    explanation:
      '\\int_1^{\\infty}\\frac{dx}{x^2+1} = \\Big[\\arctan x\\Big]_1^{\\infty} = \\frac{\\pi}{2} - \\frac{\\pi}{4} = \\frac{\\pi}{4}. \\text{ Finite integral } \\Rightarrow \\text{ series converges.}',
    difficulty: 2,
    topic: 'integral-test',
  },

  // =========================================================================
  // TAYLOR / MACLAURIN SERIES (5 questions, difficulty 3–5)
  // =========================================================================
  {
    latex:
      '\\text{Find the Maclaurin series for } f(x) = e^{-x^2}.',
    options: [
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!}',
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^{2n}}{n!}',
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{n}}{n!}',
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-x^2)^n}{(2n)!}',
    ],
    answer: '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{n!}',
    explanation:
      'e^u = \\sum_{n=0}^{\\infty}\\frac{u^n}{n!}. \\text{ Substitute } u = -x^2: \\; e^{-x^2} = \\sum_{n=0}^{\\infty}\\frac{(-x^2)^n}{n!} = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{n!}.',
    difficulty: 3,
    topic: 'taylor-series',
  },
  {
    latex:
      '\\text{Find the coefficient of } x^4 \\text{ in the Maclaurin series of } \\cos x.',
    options: [
      '\\dfrac{1}{24}',
      '\\dfrac{1}{4!} = \\dfrac{1}{24}',
      '-\\dfrac{1}{24}',
      '\\dfrac{1}{4}',
    ],
    answer: '\\dfrac{1}{24}',
    explanation:
      '\\cos x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!}. \\text{ The } x^4 \\text{ term corresponds to } n=2: \\frac{(-1)^2 x^4}{4!} = \\frac{x^4}{24}. \\text{ Coefficient} = \\frac{1}{24}.',
    difficulty: 3,
    topic: 'taylor-series',
  },
  {
    latex:
      '\\text{Compute the Taylor series of } \\ln(1+x) \\text{ centered at } x = 0.',
    options: [
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1} x^n}{n}, \\quad |x| \\le 1,\\; x \\neq -1',
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^{n} x^n}{n!}',
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{x^n}{n}',
      '\\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^{2n+1}}{2n+1}',
    ],
    answer:
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1} x^n}{n}, \\quad |x| \\le 1,\\; x \\neq -1',
    explanation:
      '\\text{Integrate } \\frac{1}{1+x} = \\sum_{n=0}^{\\infty}(-x)^n \\text{ term-by-term: } \\ln(1+x) = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}x^n}{n}.',
    difficulty: 3,
    topic: 'taylor-series',
  },
  {
    latex:
      '\\text{What is the degree-3 Taylor polynomial of } f(x)=\\sqrt{1+x} \\text{ about } x=0?',
    options: [
      '1 + \\dfrac{x}{2} - \\dfrac{x^2}{8} + \\dfrac{x^3}{16}',
      '1 + \\dfrac{x}{2} + \\dfrac{x^2}{8} + \\dfrac{x^3}{16}',
      '1 - \\dfrac{x}{2} + \\dfrac{x^2}{8} - \\dfrac{x^3}{16}',
      '1 + \\dfrac{x}{2} - \\dfrac{x^2}{4} + \\dfrac{x^3}{8}',
    ],
    answer: '1 + \\dfrac{x}{2} - \\dfrac{x^2}{8} + \\dfrac{x^3}{16}',
    explanation:
      '(1+x)^{1/2}: f=1,\\; f\'=\\frac{1}{2},\\; f\'\'=-\\frac{1}{4},\\; f\'\'\'=\\frac{3}{8}. \\; T_3 = 1+\\frac{x}{2}-\\frac{x^2}{8}+\\frac{x^3}{16}.',
    difficulty: 4,
    topic: 'taylor-series',
  },
  {
    latex:
      '\\text{Find the sum of the series } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n \\pi^{2n}}{4^n (2n)!}.',
    options: [
      '\\cos\\!\\left(\\dfrac{\\pi}{2}\\right) = 0',
      '\\sin\\!\\left(\\dfrac{\\pi}{2}\\right) = 1',
      '\\cos(\\pi) = -1',
      '\\dfrac{\\sqrt{2}}{2}',
    ],
    answer: '\\cos\\!\\left(\\dfrac{\\pi}{2}\\right) = 0',
    explanation:
      '\\cos x = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!}. \\text{ Here } x^{2n} = \\frac{\\pi^{2n}}{4^n} \\Rightarrow x = \\frac{\\pi}{2}. \\text{ So the sum is } \\cos\\!\\tfrac{\\pi}{2} = 0.',
    difficulty: 5,
    topic: 'taylor-series',
  },

  // =========================================================================
  // RADIUS OF CONVERGENCE (4 questions, difficulty 3–4)
  // =========================================================================
  {
    latex:
      '\\text{Find the radius of convergence of } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}.',
    options: [
      'R = \\infty',
      'R = 1',
      'R = e',
      'R = 0',
    ],
    answer: 'R = \\infty',
    explanation:
      '\\frac{1}{R} = \\lim_{n\\to\\infty}\\frac{1/(n+1)!}{1/n!} = \\lim_{n\\to\\infty}\\frac{1}{n+1} = 0 \\implies R = \\infty. \\text{ Series converges for all } x.',
    difficulty: 3,
    topic: 'radius-of-convergence',
  },
  {
    latex:
      '\\text{Find the radius of convergence of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(x-2)^n}{n \\cdot 3^n}.',
    options: [
      'R = 3',
      'R = 1',
      'R = \\tfrac{1}{3}',
      'R = \\infty',
    ],
    answer: 'R = 3',
    explanation:
      '\\frac{1}{R} = \\lim_{n\\to\\infty}\\left|\\frac{1/((n+1)3^{n+1})}{1/(n\\cdot 3^n)}\\right| = \\lim_{n\\to\\infty}\\frac{n}{3(n+1)} = \\frac{1}{3} \\implies R = 3.',
    difficulty: 3,
    topic: 'radius-of-convergence',
  },
  {
    latex:
      '\\text{Find the radius of convergence of } \\displaystyle\\sum_{n=0}^{\\infty} n!\\, x^n.',
    options: [
      'R = 0',
      'R = 1',
      'R = \\infty',
      'R = e^{-1}',
    ],
    answer: 'R = 0',
    explanation:
      '\\frac{a_{n+1}}{a_n} = (n+1)|x| \\to \\infty \\text{ for any } x \\ne 0. \\text{ The series converges only at } x=0, \\text{ so } R = 0.',
    difficulty: 3,
    topic: 'radius-of-convergence',
  },
  {
    latex:
      '\\text{Determine the radius of convergence of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^n (x+1)^n}{\\sqrt{n}\\,2^n}.',
    options: [
      'R = 2',
      'R = \\tfrac{1}{2}',
      'R = \\sqrt{2}',
      'R = 4',
    ],
    answer: 'R = 2',
    explanation:
      '\\frac{1}{R} = \\lim_{n\\to\\infty}\\frac{1/(\\sqrt{n+1}\\cdot 2^{n+1})}{1/(\\sqrt{n}\\cdot 2^n)} = \\lim_{n\\to\\infty}\\frac{\\sqrt{n}}{2\\sqrt{n+1}} = \\frac{1}{2} \\implies R = 2.',
    difficulty: 4,
    topic: 'radius-of-convergence',
  },

  // =========================================================================
  // ALTERNATING SERIES TEST (3 questions, difficulty 2–3)
  // =========================================================================
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{\\sqrt{n}} \\text{ converge?}',
    options: [
      '\\text{Converges (conditionally) — Alternating Series Test}',
      '\\text{Diverges — terms do not tend to 0}',
      '\\text{Converges absolutely — } \\sum 1/\\sqrt{n} \\text{ converges}',
      '\\text{Diverges — } p\\text{-series with } p < 1',
    ],
    answer: '\\text{Converges (conditionally) — Alternating Series Test}',
    explanation:
      'b_n = 1/\\sqrt{n} \\text{ is decreasing and } b_n \\to 0, \\text{ so the Alternating Series Test applies. Note } \\sum 1/\\sqrt{n} \\text{ diverges, so convergence is only conditional.}',
    difficulty: 2,
    topic: 'alternating-series',
  },
  {
    latex:
      '\\text{Determine whether } \\displaystyle\\sum_{n=2}^{\\infty} \\frac{(-1)^n \\ln n}{n} \\text{ converges.}',
    options: [
      '\\text{Converges (conditionally) — AST: } (\\ln n)/n \\text{ is eventually decreasing} \\to 0',
      '\\text{Diverges — } (\\ln n)/n \\text{ is increasing}',
      '\\text{Converges absolutely}',
      '\\text{Diverges — Limit Comparison with harmonic series}',
    ],
    answer:
      '\\text{Converges (conditionally) — AST: } (\\ln n)/n \\text{ is eventually decreasing} \\to 0',
    explanation:
      'f(x)=\\ln x/x \\text{ has } f\'(x)=(1-\\ln x)/x^2 < 0 \\text{ for } x > e, \\text{ so terms eventually decrease to 0. AST applies. Absolute series diverges by comparison with } \\sum 1/n.',
    difficulty: 3,
    topic: 'alternating-series',
  },
  {
    latex:
      '\\text{Find the minimum number of terms of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n^2} \\text{ needed to estimate the sum to within } 0.01.',
    options: [
      'n = 10 \\text{ terms}',
      'n = 5 \\text{ terms}',
      'n = 100 \\text{ terms}',
      'n = 7 \\text{ terms}',
    ],
    answer: 'n = 10 \\text{ terms}',
    explanation:
      '\\text{By the Alternating Series Estimation Theorem, the error} \\le b_{n+1} = 1/(n+1)^2. \\text{ Need } 1/(n+1)^2 < 0.01 \\Rightarrow (n+1)^2 > 100 \\Rightarrow n+1 > 10 \\Rightarrow n \\ge 10.',
    difficulty: 2,
    topic: 'alternating-series',
  },

  // =========================================================================
  // p-SERIES (3 questions, difficulty 1–2)
  // =========================================================================
  {
    latex:
      '\\text{Which of the following series converges?}',
    options: [
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^{3/2}}',
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n}',
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^{1/2}}',
      '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^{2/3}}',
    ],
    answer: '\\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^{3/2}}',
    explanation:
      '\\text{A } p\\text{-series } \\sum 1/n^p \\text{ converges iff } p > 1. \\text{ Only } p = 3/2 > 1 \\text{ satisfies this; the others have } p \\le 1.',
    difficulty: 1,
    topic: 'p-series',
  },
  {
    latex:
      '\\text{For which values of } p \\text{ does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^p} \\text{ converge?}',
    options: [
      'p > 1',
      'p \\ge 1',
      'p < 1',
      'p > 0',
    ],
    answer: 'p > 1',
    explanation:
      '\\text{The integral test: } \\int_1^{\\infty}x^{-p}dx \\text{ converges iff } p > 1. \\text{ At } p=1 \\text{ we get the harmonic series which diverges.}',
    difficulty: 1,
    topic: 'p-series',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n^{1+1/n}} \\text{ converge or diverge?}',
    options: [
      '\\text{Diverges — } p_n = 1 + 1/n \\to 1, \\text{ exponent too small}',
      '\\text{Converges — } p > 1 \\text{ for all } n',
      '\\text{Converges — Ratio Test: } L < 1',
      '\\text{Inconclusive — exponent is variable}',
    ],
    answer: '\\text{Diverges — } p_n = 1 + 1/n \\to 1, \\text{ exponent too small}',
    explanation:
      'n^{1+1/n} = n \\cdot n^{1/n} \\text{ and } n^{1/n} \\to 1, \\text{ so } 1/n^{1+1/n} \\sim 1/n. \\text{ Limit Comparison with } \\sum 1/n \\text{ gives } L = 1 > 0 \\implies \\text{ diverges.}',
    difficulty: 2,
    topic: 'p-series',
  },

  // =========================================================================
  // BONUS MIXED / HARDER QUESTIONS (to reach 30)
  // =========================================================================
  {
    latex:
      '\\text{Find all } x \\text{ for which } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{(x-3)^n}{2^n} \\text{ converges.}',
    options: [
      '1 < x < 5',
      '0 < x < 6',
      '-2 < x < 2',
      'x = 3 \\text{ only}',
    ],
    answer: '1 < x < 5',
    explanation:
      '\\text{Geometric series with ratio } r = (x-3)/2. \\text{ Converges iff } |r| < 1 \\Rightarrow |x-3| < 2 \\Rightarrow 1 < x < 5.',
    difficulty: 3,
    topic: 'radius-of-convergence',
  },
  {
    latex:
      '\\text{Evaluate } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{3^n}{5^n}.',
    options: [
      '\\dfrac{5}{2}',
      '\\dfrac{3}{2}',
      '5',
      '\\text{Diverges}',
    ],
    answer: '\\dfrac{5}{2}',
    explanation:
      '\\text{Geometric series with } a = 1,\\; r = 3/5. \\; S = \\frac{1}{1-3/5} = \\frac{1}{2/5} = \\frac{5}{2}.',
    difficulty: 1,
    topic: 'ratio-test',
  },
  {
    latex:
      '\\text{Determine convergence of } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{\\sin^2 n}{n^2}.',
    options: [
      '\\text{Converges — Direct Comparison: } \\sin^2 n \\le 1 \\text{ so } a_n \\le 1/n^2',
      '\\text{Diverges — oscillatory terms}',
      '\\text{Converges — Alternating Series Test}',
      '\\text{Diverges — Limit Comparison with } \\sum 1/n',
    ],
    answer: '\\text{Converges — Direct Comparison: } \\sin^2 n \\le 1 \\text{ so } a_n \\le 1/n^2',
    explanation:
      '0 \\le \\sin^2 n \\le 1 \\implies 0 \\le \\frac{\\sin^2 n}{n^2} \\le \\frac{1}{n^2}. \\text{ Since } \\sum 1/n^2 \\text{ converges, so does our series by Direct Comparison.}',
    difficulty: 2,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Does } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{\\sqrt{n(n+1)}} \\text{ converge or diverge?}',
    options: [
      '\\text{Diverges — Limit Comparison with } \\sum 1/n',
      '\\text{Converges — Comparison with } \\sum 1/n^2',
      '\\text{Converges — telescoping terms}',
      '\\text{Diverges — Integral Test}',
    ],
    answer: '\\text{Diverges — Limit Comparison with } \\sum 1/n',
    explanation:
      '\\lim_{n\\to\\infty}\\frac{1/\\sqrt{n(n+1)}}{1/n} = \\lim_{n\\to\\infty}\\frac{n}{\\sqrt{n(n+1)}} = \\lim_{n\\to\\infty}\\sqrt{\\frac{n}{n+1}} = 1. \\text{ Since } \\sum 1/n \\text{ diverges, so does the series.}',
    difficulty: 2,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Find the sum of the convergent series } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)}.',
    options: [
      '1',
      '\\dfrac{1}{2}',
      '\\ln 2',
      '\\dfrac{\\pi^2}{6} - 1',
    ],
    answer: '1',
    explanation:
      '\\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}. \\text{ Telescoping: } S_N = 1 - \\frac{1}{N+1} \\to 1.',
    difficulty: 1,
    topic: 'comparison-test',
  },
  {
    latex:
      '\\text{Which test is BEST suited for } \\displaystyle\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n^3 + 1}?',
    options: [
      '\\text{Absolute convergence test: } \\sum 1/(n^3+1) \\text{ converges by comparison with } \\sum 1/n^3',
      '\\text{Alternating Series Test only (not absolutely convergent)}',
      '\\text{Ratio Test}',
      '\\text{Integral Test}',
    ],
    answer:
      '\\text{Absolute convergence test: } \\sum 1/(n^3+1) \\text{ converges by comparison with } \\sum 1/n^3',
    explanation:
      '\\frac{1}{n^3+1} \\le \\frac{1}{n^3} \\text{ and } \\sum 1/n^3 \\text{ converges } (p=3>1), \\text{ so the series converges absolutely (hence converges).}',
    difficulty: 2,
    topic: 'alternating-series',
  },
  {
    latex:
      '\\text{Compute } \\displaystyle\\sum_{n=0}^{\\infty} \\frac{(-1)^n}{2^n} \\text{ (exact value).}',
    options: [
      '\\dfrac{2}{3}',
      '2',
      '\\dfrac{1}{3}',
      '\\text{Diverges}',
    ],
    answer: '\\dfrac{2}{3}',
    explanation:
      '\\text{Geometric series with } a=1,\\; r = -1/2. \\; S = \\frac{1}{1-(-1/2)} = \\frac{1}{3/2} = \\frac{2}{3}.',
    difficulty: 1,
    topic: 'ratio-test',
  },
]

async function main() {
  console.log('Seeding database with 30 calculus questions...')

  // Clear existing questions to allow re-seeding cleanly
  await prisma.question.deleteMany({})
  console.log('Cleared existing questions.')

  let created = 0
  for (const q of questions) {
    await prisma.question.create({
      data: {
        latex: q.latex,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic,
        isActive: true,
      },
    })
    created++
  }

  console.log(`\nSeeding complete: ${created} questions created.`)

  // Print a summary by topic
  const byTopic = new Map<string, number>()
  for (const q of questions) {
    byTopic.set(q.topic, (byTopic.get(q.topic) ?? 0) + 1)
  }

  console.log('\nBreakdown by topic:')
  for (const [topic, count] of byTopic.entries()) {
    console.log(`  ${topic}: ${count} question(s)`)
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
