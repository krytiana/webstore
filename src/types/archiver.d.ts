
declare module "archiver" {
  interface Archiver {
    pipe(destination: NodeJS.WritableStream): this;

    directory(
      source: string,
      dest: string
    ): this;

    finalize(): Promise<void>;

    pointer(): number;

    on(
      event: "error",
      listener: (error: Error) => void
    ): this;
  }

  interface ArchiverOptions {
    zlib?: {
      level?: number;
    };
  }

  function archiver(
    format: string,
    options?: ArchiverOptions
  ): Archiver;

  export = archiver;
}

