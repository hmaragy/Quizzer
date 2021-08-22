import React from "react";
import { Editor } from "@tinymce/tinymce-react";

const Editorr = props => {
  function handleEditorChange(e) {
    const content = e.target.getContent();
    props.onContent(content);
  }

  function handleKeypress(e) {
    const content = e.target.innerHTML;
    props.onContent(content);
  }

  return (
    <div className={props.className}>
      <Editor
        ref={props.innerRef}
        initialValue=""
        init={{
          height: 200,
          menubar: false,
          plugins: [
            "advlist autolink lists link image",
            "charmap print preview anchor help",
            "searchreplace visualblocks code",
            "insertdatetime media table paste wordcount",
          ],
          toolbar:
            "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | help",
        }}
        onKeyUp={handleKeypress}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default Editorr;
