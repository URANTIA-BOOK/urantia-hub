import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from "next/document";
import { documentLanguage } from "@/libs/documentLanguage";

type UrantiaDocumentProps = DocumentInitialProps & {
  language: string;
};

export default class UrantiaDocument extends Document<UrantiaDocumentProps> {
  static async getInitialProps(
    context: DocumentContext
  ): Promise<UrantiaDocumentProps> {
    const initialProps = await Document.getInitialProps(context);
    return {
      ...initialProps,
      language: documentLanguage(
        context.query,
        context.req?.headers.cookie
      ),
    };
  }

  render() {
    return (
      <Html lang={this.props.language}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
