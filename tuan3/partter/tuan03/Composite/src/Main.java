public class Main {
    public static void main(String[] args) {
        File f1 = new File("file1.txt");
        File f2 = new File("file2.txt");

        Folder folder1 = new Folder("Docs");
        folder1.add(f1);
        folder1.add(f2);

        Folder root = new Folder("Root");
        root.add(folder1);

        root.showDetails();
    }
}