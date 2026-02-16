// src-tauri/src/utils/latex.rs
//! LaTeX公式处理工具

/// 渲染LaTeX公式为HTML
pub fn render_latex_to_html(latex: &str) -> String {
    // TODO: 使用KaTeX或MathJax渲染
    format!("<span class=\"latex\">{}</span>", latex)
}

/// 验证LaTeX语法
pub fn validate_latex(latex: &str) -> Result<(), String> {
    // TODO: 实现LaTeX语法验证
    Ok(())
}

/// 将LaTeX转换为MathML
pub fn latex_to_mathml(latex: &str) -> String {
    // TODO: 实现LaTeX到MathML的转换
    format!("<math>{}</math>", latex)
}

/// 清理LaTeX字符串
pub fn sanitize_latex(latex: &str) -> String {
    latex
        .trim()
        .replace("$$", "")
        .replace("$", "")
        .trim()
        .to_string()
}
