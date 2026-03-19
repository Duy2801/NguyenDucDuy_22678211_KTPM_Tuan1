import java.util.ArrayList;
import java.util.List;

public class Folder implements FileSystem{
    private String name;
    private List<FileSystem> items = new ArrayList<>();

    public Folder(String name) {
        this.name = name;
    }

    public void add(FileSystem fs) {
        items.add(fs);
    }

    @Override
    public void showDetails() {
        System.out.println("Folder: " + name);
        for (FileSystem fs : items) {
            fs.showDetails();
        }
    }
}
